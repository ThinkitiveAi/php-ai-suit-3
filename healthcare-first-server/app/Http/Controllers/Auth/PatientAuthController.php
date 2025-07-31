<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PatientAuthController extends Controller
{
    /**
     * Login a patient.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'credential' => ['required', 'string'], // email or patient_id
                'password' => ['required', 'string'],
                'remember_me' => ['nullable', 'boolean'],
            ]);

            // Find patient by email or patient_id
            $patient = Patient::where('email', $request->credential)
                ->orWhere('patient_id', $request->credential)
                ->first();

            // Check if patient exists and password is correct
            if (!$patient || !Hash::check($request->password, $patient->password)) {
                throw ValidationException::withMessages([
                    'credential' => ['Invalid credentials. Please check your email/patient ID and password.'],
                ]);
            }

            // Check if patient is active
            if (!$patient->isActive()) {
                $message = match($patient->status) {
                    'inactive' => 'Your account is inactive. Please contact your healthcare provider.',
                    'suspended' => 'Your account has been suspended. Please contact your healthcare provider.',
                    default => 'Your account is not active.'
                };

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'status' => $patient->status
                ], 403);
            }

            // Revoke existing tokens for security
            $patient->tokens()->delete();

            // Create Sanctum token
            $token = $patient->createToken('patient-token', ['patient:access'])->plainTextToken;

            // Also create session for stateful authentication
            Auth::guard('patient')->login($patient, $request->remember_me ?? false);

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'data' => [
                    'patient' => [
                        'id' => $patient->id,
                        'patient_id' => $patient->patient_id,
                        'full_name' => $patient->full_name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'date_of_birth' => $patient->date_of_birth->format('Y-m-d'),
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'assigned_provider' => [
                            'id' => $patient->assignedProvider->id,
                            'name' => $patient->assignedProvider->full_name,
                            'specialization' => $patient->assignedProvider->specialization,
                            'clinic_name' => $patient->assignedProvider->clinic_name,
                        ],
                        'status' => $patient->status,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Logout the authenticated patient.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Get the authenticated patient
            $patient = Auth::guard('patient')->user();
            
            // Revoke current token if using token authentication
            if ($request->user('sanctum')) {
                $request->user('sanctum')->currentAccessToken()->delete();
            }
            
            // Revoke all tokens for this patient
            if ($patient instanceof \App\Models\Patient) {
                $patient->tokens()->delete();
            }
            
            // Logout from session
            Auth::guard('patient')->logout();
            
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get the authenticated patient's profile.
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            $patient = Auth::guard('patient')->user();

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => [
                        'id' => $patient->id,
                        'patient_id' => $patient->patient_id,
                        'first_name' => $patient->first_name,
                        'last_name' => $patient->last_name,
                        'full_name' => $patient->full_name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'date_of_birth' => $patient->date_of_birth->format('Y-m-d'),
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'full_address' => $patient->full_address,
                        'blood_type' => $patient->blood_type,
                        'allergies' => $patient->allergies,
                        'medical_history' => $patient->medical_history,
                        'current_medications' => $patient->current_medications,
                        'emergency_contact_name' => $patient->emergency_contact_name,
                        'emergency_contact_phone' => $patient->emergency_contact_phone,
                        'emergency_contact_relation' => $patient->emergency_contact_relation,
                        'insurance_provider' => $patient->insurance_provider,
                        'insurance_policy_number' => $patient->insurance_policy_number,
                        'assigned_provider' => [
                            'id' => $patient->assignedProvider->id,
                            'name' => $patient->assignedProvider->full_name,
                            'specialization' => $patient->assignedProvider->specialization,
                            'clinic_name' => $patient->assignedProvider->clinic_name,
                            'email' => $patient->assignedProvider->email,
                            'phone' => $patient->assignedProvider->phone,
                        ],
                        'status' => $patient->status,
                        'email_verified_at' => $patient->email_verified_at,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
