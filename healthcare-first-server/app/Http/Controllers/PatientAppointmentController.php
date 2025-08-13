<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PatientAppointmentController extends Controller
{
    public function listProviders(Request $request): JsonResponse
    {
        $patient = $request->user();
        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $providers = Provider::approved()
            ->select('id','first_name','last_name','specialization','clinic_name','city','state')
            ->orderBy('last_name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->full_name,
                    'specialization' => $p->specialization,
                    'clinic_name' => $p->clinic_name,
                    'location' => trim($p->city . ', ' . $p->state),
                ];
            });

        return response()->json(['success' => true, 'data' => ['providers' => $providers]]);
    }

    public function listAvailableSlots(Request $request, int $providerId): JsonResponse
    {
        $patient = $request->user();
        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = AppointmentSlot::where('provider_id', $providerId)
            ->where('is_active', true)
            ->where('is_booked', false)
            ->orderBy('date')
            ->orderBy('start_time');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->forDateRange($request->start_date, $request->end_date);
        }

        $slots = $query->get(['id','date','start_time','end_time','timezone','appointment_type','slot_duration','fee','currency','location_type','insurance_accepted']);

        return response()->json(['success' => true, 'data' => ['slots' => $slots]]);
    }

    public function book(Request $request): JsonResponse
    {
        $patient = $request->user();
        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'slot_id' => 'required|integer|exists:appointment_slots,id',
        ]);

        $slot = AppointmentSlot::where('id', $request->slot_id)
            ->where('is_active', true)
            ->lockForUpdate()
            ->first();

        if (!$slot) {
            return response()->json(['success' => false, 'message' => 'Slot not found or inactive.'], 404);
        }
        if ($slot->is_booked) {
            return response()->json(['success' => false, 'message' => 'Slot is already booked.'], 422);
        }

        try {
            DB::beginTransaction();

            $appointment = Appointment::create([
                'slot_id' => $slot->id,
                'provider_id' => $slot->provider_id,
                'patient_id' => $patient->id,
                'status' => Appointment::STATUS_SCHEDULED,
            ]);

            $slot->is_booked = true;
            $slot->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Appointment booked successfully.',
            'data' => [
                'appointment' => $appointment,
            ],
        ], 201);
    }

    public function generateSlots(Request $request, int $providerId): JsonResponse
    {
        $patient = $request->user();
        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'date' => 'required|date',
            'slot_duration' => 'nullable|integer|min:10|max:240',
        ]);

        $provider = Provider::find($providerId);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Provider not found.'], 404);
        }

        $date = \Carbon\Carbon::parse($request->date);
        $dayKey = strtolower($date->format('l'));

        $availability = $provider->availabilities()->where('day_of_week', $dayKey)->first();
        if (!$availability || !$availability->is_active) {
            return response()->json(['success' => true, 'data' => ['slots' => []]]);
        }

        $slotDuration = (int)($request->slot_duration ?? 30);
        $start = \Carbon\Carbon::parse($availability->start_time);
        $end = \Carbon\Carbon::parse($availability->end_time);
        if ($end->lessThanOrEqualTo($start)) {
            return response()->json(['success' => true, 'data' => ['slots' => []]]);
        }

        // Existing booked slots for the day
        $existing = AppointmentSlot::where('provider_id', $provider->id)
            ->where('date', $date->toDateString())
            ->get();

        $generated = [];
        $cursor = (clone $start);
        while ($cursor->addMinutes(0)->lessThan($end)) {
            $slotStart = $cursor->copy();
            $slotEnd = $slotStart->copy()->addMinutes($slotDuration);
            if ($slotEnd->greaterThan($end)) break;

            // Check existing conflicts
            $conflict = $existing->first(function ($s) use ($slotStart, $slotEnd) {
                return !($s->end_time <= $slotStart->format('H:i') || $s->start_time >= $slotEnd->format('H:i'));
            });

            $generated[] = [
                'date' => $date->toDateString(),
                'start_time' => $slotStart->format('H:i'),
                'end_time' => $slotEnd->format('H:i'),
                'timezone' => $availability->timezone ?? 'UTC',
                'is_booked' => (bool)($conflict?->is_booked),
                'existing_slot_id' => $conflict?->id,
            ];

            $cursor->addMinutes($slotDuration);
        }

        // Filter out booked
        $generated = array_values(array_filter($generated, fn($g) => $g['is_booked'] === false));

        return response()->json(['success' => true, 'data' => ['slots' => $generated]]);
    }

    public function bookByTime(Request $request): JsonResponse
    {
        $patient = $request->user();
        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'provider_id' => 'required|integer|exists:providers,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $provider = Provider::find($request->provider_id);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Provider not found.'], 404);
        }

        // Ensure weekly availability allows this day/time window
        $dayKey = strtolower(\Carbon\Carbon::parse($request->date)->format('l'));
        $availability = $provider->availabilities()->where('day_of_week', $dayKey)->first();
        if (!$availability || !$availability->is_active) {
            return response()->json(['success' => false, 'message' => 'Provider not available on selected date.'], 422);
        }
        if ($request->start_time < $availability->start_time || $request->end_time > $availability->end_time) {
            return response()->json(['success' => false, 'message' => 'Selected time outside provider availability.'], 422);
        }

        try {
            DB::beginTransaction();

            // Find or create a matching slot
            $slot = AppointmentSlot::where('provider_id', $provider->id)
                ->where('date', $request->date)
                ->where('start_time', $request->start_time)
                ->where('end_time', $request->end_time)
                ->lockForUpdate()
                ->first();

            if ($slot && $slot->is_booked) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Slot is already booked.'], 422);
            }

            if (!$slot) {
                $slot = AppointmentSlot::create([
                    'provider_id' => $provider->id,
                    'date' => $request->date,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'timezone' => $availability->timezone ?? 'UTC',
                    'appointment_type' => 'consultation',
                    'slot_duration' => \Carbon\Carbon::parse($request->start_time)->diffInMinutes(\Carbon\Carbon::parse($request->end_time)),
                    'break_duration' => 0,
                    'max_appointments' => 1,
                    'location_type' => 'virtual',
                    'is_active' => true,
                    'is_booked' => false,
                ]);
            }

            // Create appointment and mark booked
            $appointment = Appointment::create([
                'slot_id' => $slot->id,
                'provider_id' => $provider->id,
                'patient_id' => $patient->id,
                'status' => Appointment::STATUS_SCHEDULED,
            ]);

            $slot->is_booked = true;
            $slot->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully.',
                'data' => [ 'appointment' => $appointment ]
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
} 