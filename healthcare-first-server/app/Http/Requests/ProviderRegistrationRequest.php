<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use App\Models\Provider;

class ProviderRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Personal Information
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:providers'],
            'phone' => ['required', 'string', 'regex:/^[\+]?[1-9][\d]{0,15}$/', 'unique:providers'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            
            // Professional Information
            'license_number' => [
                'required', 
                'string', 
                'min:6', 
                'max:50', 
                'regex:/^[A-Za-z0-9]+$/', 
                'unique:providers'
            ],
            'specialization' => ['required', 'string', 'in:' . implode(',', Provider::getSpecializations())],
            'years_experience' => ['required', 'integer', 'min:0', 'max:50'],
            'medical_degree' => ['required', 'string', 'max:255'],
            
            // Practice Information
            'clinic_name' => ['required', 'string', 'max:255'],
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'zip_code' => ['required', 'string', 'regex:/^\d{5}(-\d{4})?$/'],
            'practice_type' => ['required', 'string', 'in:' . implode(',', Provider::getPracticeTypes())],
            
            // Authentication
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'agree_to_terms' => ['required', 'accepted'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'An account with this email already exists.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Please enter a valid phone number.',
            'phone.unique' => 'An account with this phone number already exists.',
            'profile_photo.image' => 'Profile photo must be an image.',
            'profile_photo.mimes' => 'Profile photo must be a JPEG, PNG, JPG, or GIF file.',
            'profile_photo.max' => 'Profile photo must not be larger than 2MB.',
            
            'license_number.required' => 'Medical license number is required.',
            'license_number.min' => 'License number must be at least 6 characters.',
            'license_number.regex' => 'License number must contain only letters and numbers.',
            'license_number.unique' => 'This medical license number is already registered.',
            'specialization.required' => 'Specialization is required.',
            'specialization.in' => 'Please select a valid specialization.',
            'years_experience.required' => 'Years of experience is required.',
            'years_experience.integer' => 'Years of experience must be a number.',
            'years_experience.min' => 'Years of experience cannot be negative.',
            'years_experience.max' => 'Years of experience cannot exceed 50 years.',
            'medical_degree.required' => 'Medical degree/qualification is required.',
            
            'clinic_name.required' => 'Clinic/Hospital name is required.',
            'street_address.required' => 'Street address is required.',
            'city.required' => 'City is required.',
            'state.required' => 'State is required.',
            'zip_code.required' => 'ZIP code is required.',
            'zip_code.regex' => 'Please enter a valid ZIP code (12345 or 12345-6789).',
            'practice_type.required' => 'Practice type is required.',
            'practice_type.in' => 'Please select a valid practice type.',
            
            'password.required' => 'Password is required.',
            'password.confirmed' => 'Password confirmation does not match.',
            'agree_to_terms.required' => 'You must agree to the terms and conditions.',
            'agree_to_terms.accepted' => 'You must agree to the terms and conditions.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'email' => 'email address',
            'phone' => 'phone number',
            'profile_photo' => 'profile photo',
            'license_number' => 'medical license number',
            'specialization' => 'specialization',
            'years_experience' => 'years of experience',
            'medical_degree' => 'medical degree',
            'clinic_name' => 'clinic/hospital name',
            'street_address' => 'street address',
            'city' => 'city',
            'state' => 'state',
            'zip_code' => 'ZIP code',
            'practice_type' => 'practice type',
            'password' => 'password',
            'agree_to_terms' => 'terms and conditions',
        ];
    }
}
