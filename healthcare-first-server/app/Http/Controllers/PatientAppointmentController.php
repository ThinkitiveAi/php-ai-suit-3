<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

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

        $date = Carbon::parse($request->date);
        $dayKey = strtolower($date->format('l'));

        $availability = $provider->availabilities()->where('day_of_week', $dayKey)->first();
        if (!$availability || !$availability->is_active) {
            return response()->json(['success' => true, 'data' => ['slots' => []]]);
        }

        $tz = $availability->timezone ?? 'UTC';
        $slotDuration = (int)($request->slot_duration ?? 30);

        $start = Carbon::createFromFormat('Y-m-d H:i', $date->toDateString().' '.(is_object($availability->start_time) ? $availability->start_time->format('H:i') : $availability->start_time), $tz);
        $end = Carbon::createFromFormat('Y-m-d H:i', $date->toDateString().' '.(is_object($availability->end_time) ? $availability->end_time->format('H:i') : $availability->end_time), $tz);
        if ($end->lessThanOrEqualTo($start)) {
            return response()->json(['success' => true, 'data' => ['slots' => []]]);
        }

        // Existing slots for the day
        $existing = AppointmentSlot::where('provider_id', $provider->id)
            ->where('date', $date->toDateString())
            ->get();

        $generated = [];
        $cursor = $start->copy();
        while ($cursor->lessThan($end)) {
            $slotStart = $cursor->copy();
            $slotEnd = $slotStart->copy()->addMinutes($slotDuration);
            if ($slotEnd->greaterThan($end)) {
                break;
            }

            // Check conflicts against existing slots
            $slotStartH = $slotStart->format('H:i');
            $slotEndH = $slotEnd->format('H:i');
            $conflict = $existing->first(function ($s) use ($slotStartH, $slotEndH) {
                $sStart = is_object($s->start_time) ? $s->start_time->format('H:i') : $s->start_time;
                $sEnd = is_object($s->end_time) ? $s->end_time->format('H:i') : $s->end_time;
                return !($sEnd <= $slotStartH || $sStart >= $slotEndH);
            });

            $generated[] = [
                'date' => $date->toDateString(),
                'start_time' => $slotStartH,
                'end_time' => $slotEndH,
                'timezone' => $tz,
                'is_booked' => (bool)($conflict?->is_booked),
                'existing_slot_id' => $conflict?->id,
            ];

            $cursor->addMinutes($slotDuration);
        }

        // Only return not booked slots
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
        $dayKey = strtolower(Carbon::parse($request->date)->format('l'));
        $availability = $provider->availabilities()->where('day_of_week', $dayKey)->first();
        if (!$availability || !$availability->is_active) {
            return response()->json(['success' => false, 'message' => 'Provider not available on selected date.'], 422);
        }

        $tz = $availability->timezone ?? 'UTC';
        $availStart = Carbon::createFromFormat('Y-m-d H:i', $request->date.' '.(is_object($availability->start_time) ? $availability->start_time->format('H:i') : $availability->start_time), $tz);
        $availEnd = Carbon::createFromFormat('Y-m-d H:i', $request->date.' '.(is_object($availability->end_time) ? $availability->end_time->format('H:i') : $availability->end_time), $tz);
        $requestedStart = Carbon::createFromFormat('Y-m-d H:i', $request->date.' '.$request->start_time, $tz);
        $requestedEnd = Carbon::createFromFormat('Y-m-d H:i', $request->date.' '.$request->end_time, $tz);

        if ($requestedStart->lt($availStart) || $requestedEnd->gt($availEnd)) {
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
                    'timezone' => $tz,
                    'appointment_type' => 'consultation',
                    'slot_duration' => $requestedStart->diffInMinutes($requestedEnd),
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