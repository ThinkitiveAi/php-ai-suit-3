<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AppointmentSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'date',
        'start_time',
        'end_time',
        'timezone',
        'appointment_type',
        'slot_duration',
        'break_duration',
        'max_appointments',
        'location_type',
        'location_address',
        'room_number',
        'fee',
        'currency',
        'insurance_accepted',
        'notes',
        'special_requirements',
        'recurrence',
        'recurrence_end_date',
        'is_active',
        'is_booked'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'recurrence_end_date' => 'date',
        'special_requirements' => 'array',
        'is_active' => 'boolean',
        'is_booked' => 'boolean',
        'insurance_accepted' => 'boolean',
        'fee' => 'decimal:2',
    ];

    /**
     * Get the provider that owns the slot.
     */
    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the appointment type in a readable format.
     */
    public function getAppointmentTypeNameAttribute()
    {
        return str_replace('_', ' ', ucfirst($this->appointment_type));
    }

    /**
     * Get formatted start time.
     */
    public function getFormattedStartTimeAttribute()
    {
        return Carbon::parse($this->start_time)->format('g:i A');
    }

    /**
     * Get formatted end time.
     */
    public function getFormattedEndTimeAttribute()
    {
        return Carbon::parse($this->end_time)->format('g:i A');
    }

    /**
     * Get formatted date.
     */
    public function getFormattedDateAttribute()
    {
        return $this->date->format('M d, Y');
    }

    /**
     * Get formatted fee.
     */
    public function getFormattedFeeAttribute()
    {
        if (!$this->fee) return 'Free';
        return $this->currency . ' ' . number_format($this->fee, 2);
    }

    /**
     * Scope to get active slots.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get available (not booked) slots.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_booked', false);
    }

    /**
     * Scope to get slots for a specific date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to get slots for a specific provider.
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Get appointment types.
     */
    public static function getAppointmentTypes()
    {
        return [
            'consultation' => 'Consultation',
            'follow_up' => 'Follow-up',
            'emergency' => 'Emergency',
            'routine_checkup' => 'Routine Checkup',
            'specialist_consultation' => 'Specialist Consultation',
        ];
    }

    /**
     * Get location types.
     */
    public static function getLocationTypes()
    {
        return [
            'in_person' => 'In Person',
            'virtual' => 'Virtual',
            'home_visit' => 'Home Visit',
        ];
    }

    /**
     * Get recurrence options.
     */
    public static function getRecurrenceOptions()
    {
        return [
            'none' => 'No Recurrence',
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
        ];
    }
}
