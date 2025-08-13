<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ProviderAppointmentController extends Controller
{
    /**
     * Get provider's appointments with filtering options.
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

            $query = Appointment::with(['patient:id,first_name,last_name,patient_id,email,phone', 'slot:id,date,start_time,end_time,appointment_type,location_type'])
                ->where('provider_id', $provider->id)
                ->orderBy('created_at', 'desc');

            // Filter by date range
            if ($request->filled('start_date') && $request->filled('end_date')) {
                $query->whereHas('slot', function ($q) use ($request) {
                    $q->whereBetween('date', [$request->start_date, $request->end_date]);
                });
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Filter by appointment type
            if ($request->filled('appointment_type')) {
                $query->whereHas('slot', function ($q) use ($request) {
                    $q->where('appointment_type', $request->appointment_type);
                });
            }

            $appointments = $query->get();

            // Group appointments by date
            $groupedAppointments = $appointments->groupBy(function ($appointment) {
                return $appointment->slot->date;
            })->map(function ($dateAppointments) {
                return $dateAppointments->sortBy(function ($appointment) {
                    return $appointment->slot->start_time;
                })->values();
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'appointments' => $groupedAppointments,
                    'total_count' => $appointments->count(),
                    'statuses' => Appointment::getStatuses(),
                    'appointment_types' => [
                        'consultation' => 'Consultation',
                        'follow_up' => 'Follow-up',
                        'emergency' => 'Emergency',
                        'routine_checkup' => 'Routine Checkup',
                        'specialist_consultation' => 'Specialist Consultation',
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointments.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update appointment status.
     */
    public function updateStatus(Request $request, $appointmentId): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $request->validate([
                'status' => 'required|string|in:' . implode(',', Appointment::getStatuses()),
                'notes' => 'nullable|string|max:1000',
            ]);

            $appointment = Appointment::where('id', $appointmentId)
                ->where('provider_id', $provider->id)
                ->first();

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appointment not found.'
                ], 404);
            }

            $appointment->update([
                'status' => $request->status,
                'notes' => $request->notes ?? $appointment->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully.',
                'data' => [
                    'appointment' => $appointment->load(['patient:id,first_name,last_name,patient_id,email,phone', 'slot:id,date,start_time,end_time,appointment_type,location_type'])
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get appointment statistics for the provider.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $provider = $request->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();

            $stats = [
                'today' => [
                    'total' => Appointment::where('provider_id', $provider->id)
                        ->whereHas('slot', function ($q) use ($today) {
                            $q->where('date', $today->toDateString());
                        })->count(),
                    'scheduled' => Appointment::where('provider_id', $provider->id)
                        ->where('status', Appointment::STATUS_SCHEDULED)
                        ->whereHas('slot', function ($q) use ($today) {
                            $q->where('date', $today->toDateString());
                        })->count(),
                    'completed' => Appointment::where('provider_id', $provider->id)
                        ->where('status', Appointment::STATUS_COMPLETED)
                        ->whereHas('slot', function ($q) use ($today) {
                            $q->where('date', $today->toDateString());
                        })->count(),
                ],
                'this_week' => [
                    'total' => Appointment::where('provider_id', $provider->id)
                        ->whereHas('slot', function ($q) use ($thisWeek) {
                            $q->where('date', '>=', $thisWeek->toDateString());
                        })->count(),
                ],
                'this_month' => [
                    'total' => Appointment::where('provider_id', $provider->id)
                        ->whereHas('slot', function ($q) use ($thisMonth) {
                            $q->where('date', '>=', $thisMonth->toDateString());
                        })->count(),
                ],
                'by_status' => Appointment::where('provider_id', $provider->id)
                    ->selectRaw('status, count(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
} 