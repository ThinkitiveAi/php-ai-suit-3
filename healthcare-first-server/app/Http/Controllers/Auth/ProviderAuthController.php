<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProviderRegistrationRequest;
use App\Http\Requests\ProviderLoginRequest;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProviderAuthController extends Controller
{
    /**
     * Register a new provider.
     */
    public function register(ProviderRegistrationRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();
            
            // Handle profile photo upload
            if ($request->hasFile('profile_photo')) {
                $profilePhotoPath = $request->file('profile_photo')->store('profile_photos', 'public');
                $validatedData['profile_photo'] = $profilePhotoPath;
            }

            // Remove non-database fields
            unset($validatedData['password_confirmation']);
            unset($validatedData['agree_to_terms']);

            // Create the provider
            $provider = Provider::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Your account is pending approval.',
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'full_name' => $provider->full_name,
                        'email' => $provider->email,
                        'status' => $provider->status,
                        'specialization' => $provider->specialization,
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Login a provider.
     */
    public function login(ProviderLoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            
            // Find provider by email or phone
            $provider = null;
            if ($request->login_type === 'email') {
                $provider = Provider::where('email', $request->email)->first();
            } elseif ($request->login_type === 'phone') {
                $provider = Provider::where('phone', $request->phone)->first();
            }

            // Check if provider exists and password is correct
            if (!$provider || !Hash::check($credentials['password'], $provider->password)) {
                throw ValidationException::withMessages([
                    'credential' => ['Invalid credentials. Please check your email/phone and password.'],
                ]);
            }

            // Check if provider is approved
            if (!$provider->isApproved()) {
                $message = match($provider->status) {
                    'pending' => 'Your account is pending approval. Please wait for administrator review.',
                    'rejected' => 'Your account has been rejected. ' . ($provider->rejection_reason ? 'Reason: ' . $provider->rejection_reason : ''),
                    'suspended' => 'Your account has been suspended. Please contact support.',
                    default => 'Your account is not active.'
                };

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'status' => $provider->status
                ], 403);
            }

            // Revoke existing tokens for security (optional)
            $provider->tokens()->delete();

            // Create Sanctum token
            $token = $provider->createToken('provider-token', ['provider:access'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'full_name' => $provider->full_name,
                        'email' => $provider->email,
                        'phone' => $provider->phone,
                        'specialization' => $provider->specialization,
                        'clinic_name' => $provider->clinic_name,
                        'profile_photo' => $provider->profile_photo ? Storage::url($provider->profile_photo) : null,
                        'status' => $provider->status,
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
     * Logout the authenticated provider.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Get the authenticated provider from Sanctum
            $provider = $request->user();
            
            // Revoke current token
            if ($provider) {
                $provider->currentAccessToken()->delete();
            }
            
            // Revoke all tokens for this provider (optional - for complete logout from all devices)
            if ($provider instanceof \App\Models\Provider) {
                $provider->tokens()->delete();
            }

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
     * Get the authenticated provider's profile.
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            $provider = Auth::guard('provider')->user();

            if (!$provider) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'provider' => [
                        'id' => $provider->id,
                        'first_name' => $provider->first_name,
                        'last_name' => $provider->last_name,
                        'full_name' => $provider->full_name,
                        'email' => $provider->email,
                        'phone' => $provider->phone,
                        'profile_photo' => $provider->profile_photo ? Storage::url($provider->profile_photo) : null,
                        'license_number' => $provider->license_number,
                        'specialization' => $provider->specialization,
                        'years_experience' => $provider->years_experience,
                        'medical_degree' => $provider->medical_degree,
                        'clinic_name' => $provider->clinic_name,
                        'full_address' => $provider->full_address,
                        'practice_type' => $provider->practice_type,
                        'status' => $provider->status,
                        'email_verified_at' => $provider->email_verified_at,
                        'approved_at' => $provider->approved_at,
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

    /**
     * Check if email exists.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);

        $exists = Provider::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Email already registered.' : 'Email is available.'
        ]);
    }

    /**
     * Check if phone exists.
     */
    public function checkPhone(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string']
        ]);

        $exists = Provider::where('phone', $request->phone)->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Phone number already registered.' : 'Phone number is available.'
        ]);
    }

    /**
     * Check if license number exists.
     */
    public function checkLicense(Request $request): JsonResponse
    {
        $request->validate([
            'license_number' => ['required', 'string']
        ]);

        $exists = Provider::where('license_number', $request->license_number)->exists();

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'License number already registered.' : 'License number is available.'
        ]);
    }

    /**
     * Get available specializations.
     */
    public function specializations(): JsonResponse
    {
        return response()->json([
            'specializations' => Provider::getSpecializations()
        ]);
    }

    /**
     * Get available practice types.
     */
    public function practiceTypes(): JsonResponse
    {
        return response()->json([
            'practice_types' => Provider::getPracticeTypes()
        ]);
    }
}
