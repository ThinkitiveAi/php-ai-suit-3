<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slot_id')->constrained('appointment_slots')->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->enum('status', ['scheduled','arrived','in_progress','completed','canceled','no_show','rescheduled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['slot_id']);
            $table->index(['provider_id','patient_id','status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
}; 