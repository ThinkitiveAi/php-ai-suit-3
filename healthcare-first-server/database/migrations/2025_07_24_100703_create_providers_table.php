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
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->unique();
            $table->string('profile_photo')->nullable();
            
            // Professional Information
            $table->string('license_number')->unique();
            $table->string('specialization');
            $table->integer('years_experience');
            $table->string('medical_degree');
            
            // Practice Information
            $table->string('clinic_name');
            $table->string('street_address');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->string('practice_type');
            
            // Authentication
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('remember_token')->nullable();
            
            // Account Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->string('approved_by')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
