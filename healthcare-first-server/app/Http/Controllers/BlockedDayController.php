<?php

namespace App\Http\Controllers;

use App\Models\BlockedDay;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlockedDayController extends Controller
{
    /**
     * Get provider's blocked days.
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

            $query = $provider->blockedDays()
                ->orderBy('date');

            // Filter by date range if provided
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->forDateRange($request->start_date, $request->end_date);
            }

            $blockedDays = $query->get();

            return response()->json([
                'success' => true,
                'data' => $blockedDays
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blocked days.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create a new blocked day.
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
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i|after:start_time',
                'reason' => 'nullable|string|max:255',
                'is_full_day' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if date is already blocked
            $existingBlock = $provider->blockedDays()
                ->where('date', $request->date)
                ->first();

            if ($existingBlock) {
                return response()->json([
                    'success' => false,
                    'message' => 'This date is already blocked.'
                ], 422);
            }

            $blockedDay = $provider->blockedDays()->create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Blocked day created successfully.',
                'data' => $blockedDay
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blocked day.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update a blocked day.
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

            $blockedDay = $provider->blockedDays()->find($id);
            
            if (!$blockedDay) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blocked day not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'date' => 'nullable|date|after_or_equal:today',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i|after:start_time',
                'reason' => 'nullable|string|max:255',
                'is_full_day' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if new date conflicts with existing blocks
            if ($request->has('date') && $request->date !== $blockedDay->date) {
                $existingBlock = $provider->blockedDays()
                    ->where('date', $request->date)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingBlock) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This date is already blocked.'
                    ], 422);
                }
            }

            $blockedDay->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Blocked day updated successfully.',
                'data' => $blockedDay
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update blocked day.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a blocked day.
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

            $blockedDay = $provider->blockedDays()->find($id);
            
            if (!$blockedDay) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blocked day not found.'
                ], 404);
            }

            $blockedDay->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blocked day deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blocked day.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
