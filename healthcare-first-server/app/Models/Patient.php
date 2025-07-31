<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class Patient extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Personal Information
        'patient_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'email',
        'phone',
        
        // Address Information
        'street_address',
        'city',
        'state',
        'zip_code',
        
        // Medical Information
        'blood_type',
        'allergies',
        'medical_history',
        'current_medications',
        
        // Emergency Contact
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        
        // Insurance Information
        'insurance_provider',
        'insurance_policy_number',
        
        // Authentication
        'password',
        'email_verified_at',
        
        // Provider Assignment
        'assigned_provider_id',
        'created_by_provider_id',
        
        // Account Status
        'status',
        'notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
        ];
    }

    /**
     * Boot method to auto-generate patient ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($patient) {
            if (empty($patient->patient_id)) {
                $patient->patient_id = self::generatePatientId();
            }
        });
    }

    /**
     * Generate unique patient ID
     */
    private static function generatePatientId(): string
    {
        do {
            $patientId = 'PAT' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('patient_id', $patientId)->exists());
        
        return $patientId;
    }

    /**
     * Get the patient's full name.
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->first_name . ' ' . $this->last_name,
        );
    }

    /**
     * Get the patient's full address.
     */
    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->street_address . ', ' . $this->city . ', ' . $this->state . ' ' . $this->zip_code,
        );
    }

    /**
     * Get the patient's age.
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::parse($this->date_of_birth)->age,
        );
    }

    /**
     * Check if patient is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if patient is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Activate the patient.
     */
    public function activate(): void
    {
        $this->update(['status' => 'active']);
    }

    /**
     * Suspend the patient.
     */
    public function suspend(string $reason = null): void
    {
        $this->update([
            'status' => 'suspended',
            'notes' => $reason ? $this->notes . "\n[SUSPENDED] " . $reason : $this->notes
        ]);
    }

    /**
     * Relationship: Assigned Provider
     */
    public function assignedProvider()
    {
        return $this->belongsTo(Provider::class, 'assigned_provider_id');
    }

    /**
     * Relationship: Created By Provider
     */
    public function createdByProvider()
    {
        return $this->belongsTo(Provider::class, 'created_by_provider_id');
    }

    /**
     * Scope a query to only include active patients.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to patients of a specific provider.
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('assigned_provider_id', $providerId);
    }

    /**
     * Get available blood types.
     */
    public static function getBloodTypes(): array
    {
        return [
            'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
        ];
    }

    /**
     * Get available genders.
     */
    public static function getGenders(): array
    {
        return [
            'male' => 'Male',
            'female' => 'Female',
            'other' => 'Other'
        ];
    }
}
