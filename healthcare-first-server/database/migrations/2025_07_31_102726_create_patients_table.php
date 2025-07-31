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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('patient_id')->unique(); // Auto-generated patient ID
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('email')->unique();
            $table->string('phone');
            
            // Address Information
            $table->string('street_address');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            
            // Medical Information
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('current_medications')->nullable();
            
            // Emergency Contact
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->string('emergency_contact_relation');
            
            // Insurance Information
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_policy_number')->nullable();
            
            // Authentication
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            
            // Provider Assignment
            $table->foreignId('assigned_provider_id')->constrained('providers')->onDelete('cascade');
            $table->foreignId('created_by_provider_id')->constrained('providers')->onDelete('cascade');
            
            // Account Status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->text('notes')->nullable(); // Provider notes about patient
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['assigned_provider_id', 'status']);
            $table->index('patient_id');
            $table->index(['email', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
