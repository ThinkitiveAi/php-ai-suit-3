<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'slot_id',
        'provider_id',
        'patient_id',
        'status',
        'notes',
    ];

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_ARRIVED = 'arrived';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELED = 'canceled';
    public const STATUS_NO_SHOW = 'no_show';
    public const STATUS_RESCHEDULED = 'rescheduled';

    public static function getStatuses(): array
    {
        return [
            self::STATUS_SCHEDULED,
            self::STATUS_ARRIVED,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELED,
            self::STATUS_NO_SHOW,
            self::STATUS_RESCHEDULED,
        ];
    }

    public function slot()
    {
        return $this->belongsTo(AppointmentSlot::class, 'slot_id');
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
} 