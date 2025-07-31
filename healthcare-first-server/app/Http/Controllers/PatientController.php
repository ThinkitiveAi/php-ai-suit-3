<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    /**
     * Get all patients for the authenticated provider.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $provider = Auth::guard('provider')->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $patients = Patient::forProvider($provider->id)
                ->with(['assignedProvider:id,first_name,last_name,specialization'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($patient) {
                    return [
                        'id' => $patient->id,
                        'patient_id' => $patient->patient_id,
                        'full_name' => $patient->full_name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'status' => $patient->status,
                        'created_at' => $patient->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'patients' => $patients,
                    'total' => $patients->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve patients.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create a new patient.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $provider = Auth::guard('provider')->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            $validatedData = $request->validate([
                // Personal Information
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'date_of_birth' => ['required', 'date', 'before:today'],
                'gender' => ['required', Rule::in(['male', 'female', 'other'])],
                'email' => ['required', 'email', 'unique:patients,email'],
                'phone' => ['required', 'string', 'max:20'],
                
                // Address Information
                'street_address' => ['required', 'string', 'max:255'],
                'city' => ['required', 'string', 'max:100'],
                'state' => ['required', 'string', 'max:50'],
                'zip_code' => ['required', 'string', 'max:10'],
                
                // Medical Information (optional)
                'blood_type' => ['nullable', Rule::in(Patient::getBloodTypes())],
                'allergies' => ['nullable', 'string'],
                'medical_history' => ['nullable', 'string'],
                'current_medications' => ['nullable', 'string'],
                
                // Emergency Contact
                'emergency_contact_name' => ['required', 'string', 'max:255'],
                'emergency_contact_phone' => ['required', 'string', 'max:20'],
                'emergency_contact_relation' => ['required', 'string', 'max:100'],
                
                // Insurance Information (optional)
                'insurance_provider' => ['nullable', 'string', 'max:255'],
                'insurance_policy_number' => ['nullable', 'string', 'max:100'],
                
                // Notes
                'notes' => ['nullable', 'string'],
            ]);

            // Generate a temporary password (you might want to send this via email)
            $temporaryPassword = 'temp' . rand(10000, 99999);
            $validatedData['password'] = Hash::make($temporaryPassword);
            
            // Set provider relationships
            $validatedData['assigned_provider_id'] = $provider->id;
            $validatedData['created_by_provider_id'] = $provider->id;
            $validatedData['status'] = 'active';

            // Create the patient
            $patient = Patient::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Patient created successfully!',
                'data' => [
                    'patient' => [
                        'id' => $patient->id,
                        'patient_id' => $patient->patient_id,
                        'full_name' => $patient->full_name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'status' => $patient->status,
                        'created_at' => $patient->created_at->format('Y-m-d H:i:s'),
                    ],
                    'temporary_password' => $temporaryPassword, // In production, send via email
                    'login_instructions' => 'Patient can login using their email or Patient ID: ' . $patient->patient_id
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create patient.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Show a specific patient.
     */
    public function show(Request $request, Patient $patient): JsonResponse
    {
        try {
            $provider = Auth::guard('provider')->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            // Check if patient belongs to this provider
            if ($patient->assigned_provider_id !== $provider->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found or access denied.'
                ], 404);
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
                        'status' => $patient->status,
                        'notes' => $patient->notes,
                        'created_at' => $patient->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $patient->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve patient.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update a patient.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        try {
            $provider = Auth::guard('provider')->user();
            
            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            // Check if patient belongs to this provider
            if ($patient->assigned_provider_id !== $provider->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found or access denied.'
                ], 404);
            }

            $validatedData = $request->validate([
                // Personal Information
                'first_name' => ['sometimes', 'string', 'max:255'],
                'last_name' => ['sometimes', 'string', 'max:255'],
                'date_of_birth' => ['sometimes', 'date', 'before:today'],
                'gender' => ['sometimes', Rule::in(['male', 'female', 'other'])],
                'email' => ['sometimes', 'email', Rule::unique('patients', 'email')->ignore($patient->id)],
                'phone' => ['sometimes', 'string', 'max:20'],
                
                // Address Information
                'street_address' => ['sometimes', 'string', 'max:255'],
                'city' => ['sometimes', 'string', 'max:100'],
                'state' => ['sometimes', 'string', 'max:50'],
                'zip_code' => ['sometimes', 'string', 'max:10'],
                
                // Medical Information
                'blood_type' => ['nullable', Rule::in(Patient::getBloodTypes())],
                'allergies' => ['nullable', 'string'],
                'medical_history' => ['nullable', 'string'],
                'current_medications' => ['nullable', 'string'],
                
                // Emergency Contact
                'emergency_contact_name' => ['sometimes', 'string', 'max:255'],
                'emergency_contact_phone' => ['sometimes', 'string', 'max:20'],
                'emergency_contact_relation' => ['sometimes', 'string', 'max:100'],
                
                // Insurance Information
                'insurance_provider' => ['nullable', 'string', 'max:255'],
                'insurance_policy_number' => ['nullable', 'string', 'max:100'],
                
                // Status and Notes
                'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
                'notes' => ['nullable', 'string'],
            ]);

            $patient->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Patient updated successfully!',
                'data' => [
                    'patient' => [
                        'id' => $patient->id,
                        'patient_id' => $patient->patient_id,
                        'full_name' => $patient->full_name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'age' => $patient->age,
                        'gender' => $patient->gender,
                        'status' => $patient->status,
                        'updated_at' => $patient->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update patient.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get reference data for patient forms.
     */
    public function referenceData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'blood_types' => Patient::getBloodTypes(),
                'genders' => Patient::getGenders(),
            ]
        ]);
    }
}
