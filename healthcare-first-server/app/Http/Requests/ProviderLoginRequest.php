<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProviderLoginRequest extends FormRequest
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
            'credential' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember_me' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'credential.required' => 'Email or phone number is required.',
            'password.required' => 'Password is required.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'credential' => 'email or phone number',
            'password' => 'password',
            'remember_me' => 'remember me',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Determine if credential is email or phone
        $credential = $this->credential;
        
        if (filter_var($credential, FILTER_VALIDATE_EMAIL)) {
            $this->merge([
                'email' => $credential,
                'login_type' => 'email'
            ]);
        } elseif (preg_match('/^[\+]?[1-9][\d]{0,15}$/', str_replace([' ', '-', '(', ')'], '', $credential))) {
            $this->merge([
                'phone' => $credential,
                'login_type' => 'phone'
            ]);
        }
    }
}
