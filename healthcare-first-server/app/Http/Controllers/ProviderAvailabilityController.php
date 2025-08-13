<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use App\Models\ProviderAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ProviderAvailabilityController extends Controller
{
    /**
     * Get provider's availability settings.
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

            $availabilities = $provider->availabilities()
                ->orderBy('day_of_week')
                ->get();

            // Get all days of the week
            $daysOfWeek = ProviderAvailability::getDaysOfWeek();
            
            // Create a complete availability structure with all days
            $availabilityData = [];
            foreach ($daysOfWeek as $dayKey => $dayName) {
                $existingAvailability = $availabilities->where('day_of_week', $dayKey)->first();
                
                $availabilityData[] = [
                    'id' => $existingAvailability ? $existingAvailability->id : null,
                    'day_of_week' => $dayKey,
                    'day_name' => $dayName,
                    'start_time' => $existingAvailability ? $existingAvailability->start_time : null,
                    'end_time' => $existingAvailability ? $existingAvailability->end_time : null,
                    'timezone' => $existingAvailability ? $existingAvailability->timezone : 'UTC',
                    'is_active' => $existingAvailability ? $existingAvailability->is_active : false,
                    'formatted_start_time' => $existingAvailability ? $existingAvailability->formatted_start_time : null,
                    'formatted_end_time' => $existingAvailability ? $existingAvailability->formatted_end_time : null,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'name' => $provider->full_name,
                        'specialization' => $provider->specialization,
                        'clinic_name' => $provider->clinic_name,
                    ],
                    'availabilities' => $availabilityData,
                    'timezones' => $this->getTimezones(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability settings.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update provider's availability settings.
     */
    public function update(Request $request): JsonResponse
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
                'availabilities' => 'required|array',
                'availabilities.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'availabilities.*.start_time' => 'nullable|date_format:H:i',
                'availabilities.*.end_time' => 'nullable|date_format:H:i|after:availabilities.*.start_time',
                'availabilities.*.timezone' => 'nullable|string|max:50',
                'availabilities.*.is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $availabilities = $request->availabilities;
            
            foreach ($availabilities as $availabilityData) {
                $dayOfWeek = $availabilityData['day_of_week'];
                $isActive = $availabilityData['is_active'] ?? false;

                // If the day is marked inactive, remove any existing availability record and continue
                if (!$isActive) {
                    $existing = $provider->availabilities()->where('day_of_week', $dayOfWeek)->first();
                    if ($existing) {
                        $existing->delete();
                    }
                    continue;
                }
                
                if ($isActive && (!isset($availabilityData['start_time']) || !isset($availabilityData['end_time']))) {
                    return response()->json([
                        'success' => false,
                        'message' => "Start time and end time are required for active availability on {$dayOfWeek}."
                    ], 422);
                }

                // Update or create availability for active days
                $provider->availabilities()->updateOrCreate(
                    ['day_of_week' => $dayOfWeek],
                    [
                        'start_time' => $availabilityData['start_time'],
                        'end_time' => $availabilityData['end_time'],
                        'timezone' => $availabilityData['timezone'] ?? 'UTC',
                        'is_active' => true,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Availability settings updated successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability settings.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a specific availability.
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

            $availability = $provider->availabilities()->find($id);
            
            if (!$availability) {
                return response()->json([
                    'success' => false,
                    'message' => 'Availability not found.'
                ], 404);
            }

            $availability->delete();

            return response()->json([
                'success' => true,
                'message' => 'Availability deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete availability.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get provider's availability settings for patients to view.
     */
    public function showForPatient(Request $request, $providerId): JsonResponse
    {
        try {
            $patient = $request->user();
            
            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            // Find the provider
            $provider = Provider::find($providerId);
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provider not found.'
                ], 404);
            }

            $availabilities = $provider->availabilities()
                ->orderBy('day_of_week')
                ->get();

            // Get all days of the week
            $daysOfWeek = ProviderAvailability::getDaysOfWeek();
            
            // Create a complete availability structure
            $availabilityData = [];
            foreach ($daysOfWeek as $dayKey => $dayName) {
                $availability = $availabilities->where('day_of_week', $dayKey)->first();
                $availabilityData[] = [
                    'id' => $availability ? $availability->id : null,
                    'day_of_week' => $dayKey,
                    'day_name' => $dayName,
                    'start_time' => $availability ? $availability->start_time : null,
                    'end_time' => $availability ? $availability->end_time : null,
                    'timezone' => $availability ? $availability->timezone : 'UTC',
                    'is_active' => $availability ? $availability->is_active : false,
                    'formatted_start_time' => $availability ? $availability->formatted_start_time : null,
                    'formatted_end_time' => $availability ? $availability->formatted_end_time : null,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'name' => $provider->full_name,
                        'specialization' => $provider->specialization,
                        'clinic_name' => $provider->clinic_name,
                    ],
                    'availabilities' => $availabilityData,
                    'timezones' => $this->getTimezones(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability settings.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a provider's availability for a specific date (patient view).
     */
    public function showForPatientDate(Request $request, $providerId): JsonResponse
    {
        try {
            $patient = $request->user();
            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $request->validate([
                'date' => 'required|date',
            ]);

            $provider = Provider::find($providerId);
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provider not found.'
                ], 404);
            }

            $date = Carbon::parse($request->get('date'));
            $dayKey = strtolower($date->format('l')); // e.g. "monday"

            $availability = $provider->availabilities()->where('day_of_week', $dayKey)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'name' => $provider->full_name,
                    ],
                    'date' => $date->toDateString(),
                    'day_of_week' => $dayKey,
                    'is_available' => (bool)($availability?->is_active),
                    'start_time' => ($availability && $availability->is_active) ? Carbon::parse($availability->start_time)->format('H:i') : null,
                    'end_time' => ($availability && $availability->is_active) ? Carbon::parse($availability->end_time)->format('H:i') : null,
                    'timezone' => $availability?->timezone ?? 'UTC',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve date availability.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get available timezones.
     */
    private function getTimezones(): array
    {
        return [
            'UTC' => 'UTC',
            'America/New_York' => 'Eastern Time',
            'America/Chicago' => 'Central Time',
            'America/Denver' => 'Mountain Time',
            'America/Los_Angeles' => 'Pacific Time',
            'Europe/London' => 'London',
            'Europe/Paris' => 'Paris',
            'Asia/Tokyo' => 'Tokyo',
            'Asia/Shanghai' => 'Shanghai',
            'Australia/Sydney' => 'Sydney',
        ];
    }
}
