<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Provider;
use Illuminate\Support\Facades\Hash;

class ProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo provider for testing
        Provider::create([
            'first_name' => 'Dr. John',
            'last_name' => 'Doe',
            'email' => 'demo@healthcare.com',
            'phone' => '+1234567890',
            'license_number' => 'MD123456',
            'specialization' => 'Cardiology',
            'years_experience' => 15,
            'medical_degree' => 'MD',
            'clinic_name' => 'Heart Care Medical Center',
            'street_address' => '123 Medical Drive',
            'city' => 'New York',
            'state' => 'NY',
            'zip_code' => '10001',
            'practice_type' => 'Hospital',
            'password' => Hash::make('demo123'),
            'status' => 'approved',
            'approved_at' => now(),
            'email_verified_at' => now(),
        ]);

        // Create additional test providers
        Provider::create([
            'first_name' => 'Dr. Sarah',
            'last_name' => 'Smith',
            'email' => 'sarah.smith@healthcare.com',
            'phone' => '+1234567891',
            'license_number' => 'MD789012',
            'specialization' => 'Pediatrics',
            'years_experience' => 8,
            'medical_degree' => 'MD',
            'clinic_name' => 'Children\'s Health Clinic',
            'street_address' => '456 Kids Avenue',
            'city' => 'Los Angeles',
            'state' => 'CA',
            'zip_code' => '90210',
            'practice_type' => 'Private Practice',
            'password' => Hash::make('password123'),
            'status' => 'pending',
            'email_verified_at' => now(),
        ]);

        Provider::create([
            'first_name' => 'Dr. Michael',
            'last_name' => 'Johnson',
            'email' => 'michael.johnson@healthcare.com',
            'phone' => '+1234567892',
            'license_number' => 'MD345678',
            'specialization' => 'Neurology',
            'years_experience' => 20,
            'medical_degree' => 'MD, PhD',
            'clinic_name' => 'Brain & Spine Institute',
            'street_address' => '789 Neuro Street',
            'city' => 'Chicago',
            'state' => 'IL',
            'zip_code' => '60601',
            'practice_type' => 'Academic Medical Center',
            'password' => Hash::make('password123'),
            'status' => 'approved',
            'approved_at' => now(),
            'email_verified_at' => now(),
        ]);

        Provider::create([
            'first_name' => 'Dr. Emily',
            'last_name' => 'Brown',
            'email' => 'emily.brown@healthcare.com',
            'phone' => '+1234567893',
            'license_number' => 'MD901234',
            'specialization' => 'Dermatology',
            'years_experience' => 12,
            'medical_degree' => 'MD',
            'clinic_name' => 'Skin Care Specialists',
            'street_address' => '321 Derma Lane',
            'city' => 'Miami',
            'state' => 'FL',
            'zip_code' => '33101',
            'practice_type' => 'Clinic',
            'password' => Hash::make('password123'),
            'status' => 'rejected',
            'rejection_reason' => 'Unable to verify medical license.',
            'email_verified_at' => now(),
        ]);

        // Test duplicate email scenario
        Provider::create([
            'first_name' => 'Existing',
            'last_name' => 'Provider',
            'email' => 'existing@healthcare.com',
            'phone' => '+1234567894',
            'license_number' => 'MD567890',
            'specialization' => 'Family Medicine',
            'years_experience' => 5,
            'medical_degree' => 'MD',
            'clinic_name' => 'Family Health Center',
            'street_address' => '654 Family Way',
            'city' => 'Houston',
            'state' => 'TX',
            'zip_code' => '77001',
            'practice_type' => 'Community Health Center',
            'password' => Hash::make('password123'),
            'status' => 'approved',
            'approved_at' => now(),
            'email_verified_at' => now(),
        ]);

        // Test duplicate license scenario
        Provider::create([
            'first_name' => 'Dr. License',
            'last_name' => 'Test',
            'email' => 'license.test@healthcare.com',
            'phone' => '+1234567895',
            'license_number' => '12345',
            'specialization' => 'Surgery',
            'years_experience' => 25,
            'medical_degree' => 'MD',
            'clinic_name' => 'Surgical Excellence Center',
            'street_address' => '987 Surgery Blvd',
            'city' => 'Dallas',
            'state' => 'TX',
            'zip_code' => '75201',
            'practice_type' => 'Hospital',
            'password' => Hash::make('password123'),
            'status' => 'approved',
            'approved_at' => now(),
            'email_verified_at' => now(),
        ]);
    }
}
