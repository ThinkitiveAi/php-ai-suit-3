<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointment_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('timezone', 50)->default('UTC');
            $table->enum('appointment_type', ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_consultation']);
            $table->integer('slot_duration')->comment('Duration in minutes');
            $table->integer('break_duration')->default(0)->comment('Break duration in minutes');
            $table->integer('max_appointments')->default(1);
            $table->enum('location_type', ['in_person', 'virtual', 'home_visit']);
            $table->string('location_address')->nullable();
            $table->string('room_number')->nullable();
            $table->decimal('fee', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->boolean('insurance_accepted')->default(false);
            $table->text('notes')->nullable();
            $table->json('special_requirements')->nullable();
            $table->enum('recurrence', ['none', 'daily', 'weekly', 'monthly'])->default('none');
            $table->date('recurrence_end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_booked')->default(false);
            $table->timestamps();
            
            // Indexes for efficient querying
            $table->index(['provider_id', 'date', 'start_time']);
            $table->index(['date', 'is_active', 'is_booked']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_slots');
    }
};
