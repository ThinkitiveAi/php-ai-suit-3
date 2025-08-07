<?php

namespace App\Http\Controllers;

use App\Models\AppointmentSlot;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentSlotController extends Controller
{
    /**
     * Get provider's appointment slots.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $query = $provider->appointmentSlots()
                ->with('provider:id,first_name,last_name,specialization,clinic_name')
                ->orderBy('date')
                ->orderBy('start_time');

            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->forDateRange($request->start_date, $request->end_date);
            }

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'available') {
                    $query->available();
                } elseif ($request->status === 'booked') {
                    $query->where('is_booked', true);
                }
            }

            $slots = $query->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'slots' => $slots,
                    'appointment_types' => AppointmentSlot::getAppointmentTypes(),
                    'location_types' => AppointmentSlot::getLocationTypes(),
                    'recurrence_options' => AppointmentSlot::getRecurrenceOptions(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointment slots.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create a new appointment slot.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'timezone' => 'required|string|max:50',
                'appointment_type' => 'required|string|in:consultation,follow_up,emergency,routine_checkup,specialist_consultation',
                'slot_duration' => 'required|integer|min:15|max:480',
                'break_duration' => 'nullable|integer|min:0|max:120',
                'max_appointments' => 'required|integer|min:1|max:10',
                'location_type' => 'required|string|in:in_person,virtual,home_visit',
                'location_address' => 'nullable|string|max:255',
                'room_number' => 'nullable|string|max:50',
                'fee' => 'nullable|numeric|min:0',
                'currency' => 'nullable|string|size:3',
                'insurance_accepted' => 'nullable|boolean',
                'notes' => 'nullable|string|max:1000',
                'special_requirements' => 'nullable|array',
                'recurrence' => 'required|string|in:none,daily,weekly,monthly',
                'recurrence_end_date' => 'nullable|date|after:date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for conflicts
            $conflicts = $this->checkSlotConflicts($provider->id, $request->date, $request->start_time, $request->end_time);
            if (!empty($conflicts)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot conflicts detected.',
                    'conflicts' => $conflicts
                ], 422);
            }

            $slotData = $request->all();
            $slotData['provider_id'] = $provider->id;

            $slot = AppointmentSlot::create($slotData);

            // Handle recurrence
            if ($request->recurrence !== 'none' && $request->recurrence_end_date) {
                $this->createRecurringSlots($slot, $request->recurrence, $request->recurrence_end_date);
            }

            return response()->json([
                'success' => true,
                'message' => 'Appointment slot created successfully.',
                'data' => $slot->load('provider')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment slot.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update an appointment slot.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $slot = $provider->appointmentSlots()->find($id);
            
            if (!$slot) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment slot not found.'
                ], 404);
            }

            // Check if slot is already booked
            if ($slot->is_booked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update a booked appointment slot.'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'date' => 'nullable|date|after_or_equal:today',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i|after:start_time',
                'timezone' => 'nullable|string|max:50',
                'appointment_type' => 'nullable|string|in:consultation,follow_up,emergency,routine_checkup,specialist_consultation',
                'slot_duration' => 'nullable|integer|min:15|max:480',
                'break_duration' => 'nullable|integer|min:0|max:120',
                'max_appointments' => 'nullable|integer|min:1|max:10',
                'location_type' => 'nullable|string|in:in_person,virtual,home_visit',
                'location_address' => 'nullable|string|max:255',
                'room_number' => 'nullable|string|max:50',
                'fee' => 'nullable|numeric|min:0',
                'currency' => 'nullable|string|size:3',
                'insurance_accepted' => 'nullable|boolean',
                'notes' => 'nullable|string|max:1000',
                'special_requirements' => 'nullable|array',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for conflicts if time/date is being changed
            if ($request->has('date') || $request->has('start_time') || $request->has('end_time')) {
                $conflicts = $this->checkSlotConflicts(
                    $provider->id, 
                    $request->date ?? $slot->date,
                    $request->start_time ?? $slot->start_time,
                    $request->end_time ?? $slot->end_time,
                    $slot->id
                );
                if (!empty($conflicts)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Slot conflicts detected.',
                        'conflicts' => $conflicts
                    ], 422);
                }
            }

            $slot->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Appointment slot updated successfully.',
                'data' => $slot->load('provider')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment slot.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete an appointment slot.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $slot = $provider->appointmentSlots()->find($id);
            
            if (!$slot) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment slot not found.'
                ], 404);
            }

            // Check if slot is already booked
            if ($slot->is_booked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete a booked appointment slot.'
                ], 422);
            }

            $slot->delete();

            return response()->json([
                'success' => true,
                'message' => 'Appointment slot deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete appointment slot.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Check for slot conflicts.
     */
    private function checkSlotConflicts($providerId, $date, $startTime, $endTime, $excludeSlotId = null): array
    {
        $query = AppointmentSlot::where('provider_id', $providerId)
            ->where('date', $date)
            ->where('is_active', true)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeSlotId) {
            $query->where('id', '!=', $excludeSlotId);
        }

        return $query->get()->toArray();
    }

    /**
     * Create recurring slots.
     */
    private function createRecurringSlots($originalSlot, $recurrence, $endDate): void
    {
        $currentDate = Carbon::parse($originalSlot->date)->addDay();
        $endDate = Carbon::parse($endDate);

        while ($currentDate <= $endDate) {
            $slotData = $originalSlot->toArray();
            unset($slotData['id'], $slotData['created_at'], $slotData['updated_at']);
            $slotData['date'] = $currentDate->format('Y-m-d');
            $slotData['recurrence'] = 'none'; // Prevent infinite recursion

            AppointmentSlot::create($slotData);

            // Increment date based on recurrence
            switch ($recurrence) {
                case 'daily':
                    $currentDate->addDay();
                    break;
                case 'weekly':
                    $currentDate->addWeek();
                    break;
                case 'monthly':
                    $currentDate->addMonth();
                    break;
            }
        }
    }
}
