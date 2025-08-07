<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class Provider extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Personal Information
        'first_name',
        'last_name',
        'email',
        'phone',
        'profile_photo',
        
        // Professional Information
        'license_number',
        'specialization',
        'years_experience',
        'medical_degree',
        
        // Practice Information
        'clinic_name',
        'street_address',
        'city',
        'state',
        'zip_code',
        'practice_type',
        
        // Authentication
        'password',
        'email_verified_at',
        
        // Account Status
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
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
            'approved_at' => 'datetime',
            'password' => 'hashed',
            'years_experience' => 'integer',
        ];
    }

    /**
     * Get the provider's full name.
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->first_name . ' ' . $this->last_name,
        );
    }

    /**
     * Get the provider's full address.
     */
    protected function fullAddress(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->street_address . ', ' . $this->city . ', ' . $this->state . ' ' . $this->zip_code,
        );
    }

    /**
     * Check if provider is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if provider is pending approval.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if provider is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if provider is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Approve the provider.
     */
    public function approve(string $approvedBy = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject the provider.
     */
    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }

    /**
     * Suspend the provider.
     */
    public function suspend(string $reason = null): void
    {
        $this->update([
            'status' => 'suspended',
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Scope a query to only include approved providers.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include pending providers.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Get available specializations.
     */
    public static function getSpecializations(): array
    {
        return [
            'Cardiology',
            'Dermatology', 
            'Pediatrics',
            'Neurology',
            'Orthopedics',
            'Psychiatry',
            'Radiology',
            'Anesthesiology',
            'Emergency Medicine',
            'Family Medicine',
            'Internal Medicine',
            'Obstetrics & Gynecology',
            'Oncology',
            'Ophthalmology',
            'Pathology',
            'Surgery',
            'Urology'
        ];
    }

    /**
     * Get available practice types.
     */
    public static function getPracticeTypes(): array
    {
        return [
            'Private Practice',
            'Hospital',
            'Clinic',
            'Academic Medical Center',
            'Community Health Center',
            'Urgent Care',
            'Specialty Center'
        ];
    }

    /**
     * Relationship: Patients assigned to this provider
     */
    public function patients()
    {
        return $this->hasMany(Patient::class, 'assigned_provider_id');
    }

    /**
     * Relationship: Patients created by this provider
     */
    public function createdPatients()
    {
        return $this->hasMany(Patient::class, 'created_by_provider_id');
    }

    /**
     * Get the provider's availabilities.
     */
    public function availabilities()
    {
        return $this->hasMany(ProviderAvailability::class);
    }

    /**
     * Get the provider's appointment slots.
     */
    public function appointmentSlots()
    {
        return $this->hasMany(AppointmentSlot::class);
    }

    /**
     * Get the provider's blocked days.
     */
    public function blockedDays()
    {
        return $this->hasMany(BlockedDay::class);
    }
}
