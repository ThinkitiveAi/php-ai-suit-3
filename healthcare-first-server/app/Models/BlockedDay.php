<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BlockedDay extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'date',
        'start_time',
        'end_time',
        'reason',
        'is_full_day'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_full_day' => 'boolean',
    ];

    /**
     * Get the provider that owns the blocked day.
     */
    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get formatted date.
     */
    public function getFormattedDateAttribute()
    {
        return $this->date->format('M d, Y');
    }

    /**
     * Get formatted start time.
     */
    public function getFormattedStartTimeAttribute()
    {
        if (!$this->start_time) return null;
        return Carbon::parse($this->start_time)->format('g:i A');
    }

    /**
     * Get formatted end time.
     */
    public function getFormattedEndTimeAttribute()
    {
        if (!$this->end_time) return null;
        return Carbon::parse($this->end_time)->format('g:i A');
    }

    /**
     * Scope to get blocked days for a specific date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to get blocked days for a specific provider.
     */
    public function scopeForProvider($query, $providerId)
    {
        return $query->where('provider_id', $providerId);
    }

    /**
     * Scope to get full day blocks.
     */
    public function scopeFullDay($query)
    {
        return $query->where('is_full_day', true);
    }

    /**
     * Scope to get partial day blocks.
     */
    public function scopePartialDay($query)
    {
        return $query->where('is_full_day', false);
    }
}
