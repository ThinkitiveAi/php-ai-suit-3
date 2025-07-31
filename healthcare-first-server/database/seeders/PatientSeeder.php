<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Provider;
use Illuminate\Support\Facades\Hash;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get approved providers to assign patients to
        $providers = Provider::where('status', 'approved')->get();
        
        if ($providers->isEmpty()) {
            $this->command->warn('No approved providers found. Please run ProviderSeeder first.');
            return;
        }

        // Get the demo provider for our main test patients
        $demoProvider = Provider::where('email', 'demo@healthcare.com')->first();
        $assignedProvider = $demoProvider ?: $providers->first();

        // Create test patients
        $patients = [
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'date_of_birth' => '1985-03-15',
                'gender' => 'male',
                'email' => 'john.smith@email.com',
                'phone' => '+1234567891',
                'street_address' => '456 Oak Street',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
                'blood_type' => 'O+',
                'allergies' => 'Penicillin',
                'medical_history' => 'Hypertension, controlled with medication',
                'current_medications' => 'Lisinopril 10mg daily',
                'emergency_contact_name' => 'Jane Smith',
                'emergency_contact_phone' => '+1234567892',
                'emergency_contact_relation' => 'Spouse',
                'insurance_provider' => 'Blue Cross Blue Shield',
                'insurance_policy_number' => 'BCBS123456',
                'password' => Hash::make('patient123'),
                'status' => 'active',
                'assigned_provider_id' => $assignedProvider->id,
                'created_by_provider_id' => $assignedProvider->id,
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Mary',
                'last_name' => 'Johnson',
                'date_of_birth' => '1992-07-22',
                'gender' => 'female',
                'email' => 'mary.johnson@email.com',
                'phone' => '+1234567893',
                'street_address' => '789 Pine Avenue',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10002',
                'blood_type' => 'A+',
                'allergies' => 'None known',
                'medical_history' => 'Healthy, annual checkups',
                'current_medications' => 'Multivitamin',
                'emergency_contact_name' => 'Robert Johnson',
                'emergency_contact_phone' => '+1234567894',
                'emergency_contact_relation' => 'Father',
                'insurance_provider' => 'Aetna',
                'insurance_policy_number' => 'AET789012',
                'password' => Hash::make('patient123'),
                'status' => 'active',
                'assigned_provider_id' => $assignedProvider->id,
                'created_by_provider_id' => $assignedProvider->id,
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Wilson',
                'date_of_birth' => '1978-11-08',
                'gender' => 'male',
                'email' => 'robert.wilson@email.com',
                'phone' => '+1234567895',
                'street_address' => '321 Elm Drive',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10003',
                'blood_type' => 'B-',
                'allergies' => 'Shellfish, Tree nuts',
                'medical_history' => 'Diabetes Type 2, diagnosed 2020',
                'current_medications' => 'Metformin 500mg twice daily, Glipizide 5mg daily',
                'emergency_contact_name' => 'Sarah Wilson',
                'emergency_contact_phone' => '+1234567896',
                'emergency_contact_relation' => 'Spouse',
                'insurance_provider' => 'Cigna',
                'insurance_policy_number' => 'CIG345678',
                'password' => Hash::make('patient123'),
                'status' => 'active',
                'assigned_provider_id' => $assignedProvider->id,
                'created_by_provider_id' => $assignedProvider->id,
                'email_verified_at' => now(),
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Davis',
                'date_of_birth' => '2000-05-12',
                'gender' => 'female',
                'email' => 'emily.davis@email.com',
                'phone' => '+1234567897',
                'street_address' => '654 Maple Street',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10004',
                'blood_type' => 'AB+',
                'allergies' => 'Latex',
                'medical_history' => 'Asthma, well controlled',
                'current_medications' => 'Albuterol inhaler as needed',
                'emergency_contact_name' => 'Michael Davis',
                'emergency_contact_phone' => '+1234567898',
                'emergency_contact_relation' => 'Father',
                'insurance_provider' => 'United Healthcare',
                'insurance_policy_number' => 'UHC901234',
                'password' => Hash::make('patient123'),
                'status' => 'active',
                'assigned_provider_id' => $assignedProvider->id,
                'created_by_provider_id' => $assignedProvider->id,
                'email_verified_at' => now(),
            ],
        ];

        // Create patients
        foreach ($patients as $patientData) {
            Patient::create($patientData);
        }

        // If we have multiple providers, distribute some patients to other providers
        if ($providers->count() > 1) {
            $secondProvider = $providers->where('id', '!=', $assignedProvider->id)->first();
            
            Patient::create([
                'first_name' => 'David',
                'last_name' => 'Brown',
                'date_of_birth' => '1965-12-03',
                'gender' => 'male',
                'email' => 'david.brown@email.com',
                'phone' => '+1234567899',
                'street_address' => '987 Cedar Lane',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10005',
                'blood_type' => 'O-',
                'allergies' => 'None known',
                'medical_history' => 'High cholesterol',
                'current_medications' => 'Atorvastatin 20mg daily',
                'emergency_contact_name' => 'Linda Brown',
                'emergency_contact_phone' => '+1234567800',
                'emergency_contact_relation' => 'Spouse',
                'insurance_provider' => 'Medicare',
                'insurance_policy_number' => 'MED567890',
                'password' => Hash::make('patient123'),
                'status' => 'active',
                'assigned_provider_id' => $secondProvider->id,
                'created_by_provider_id' => $secondProvider->id,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Patient seeder completed successfully.');
        $this->command->info('Test patients created with password: patient123');
        $this->command->info('Patients can login using their email or auto-generated Patient ID');
    }
}
