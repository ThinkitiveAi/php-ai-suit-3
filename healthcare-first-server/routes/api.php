<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ProviderAuthController;
use App\Http\Controllers\Auth\PatientAuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ProviderAvailabilityController;
use App\Http\Controllers\AppointmentSlotController;
use App\Http\Controllers\BlockedDayController;

// CSRF cookie endpoint for Sanctum
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Test route for CORS
Route::get('/test-cors', function (Request $request) {
    return response()->json([
        'message' => 'CORS is working!',
        'origin' => $request->headers->get('Origin'),
        'timestamp' => now()
    ]);
});

// Test route for availability
Route::get('/test-availability', function () {
    return response()->json([
        'message' => 'Availability endpoint is working!',
        'timestamp' => now()
    ]);
});

// Test route for basic routing
Route::get('/test-routing', function () {
    return response()->json([
        'message' => 'Basic routing is working!',
        'timestamp' => now()
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Provider routes (no authentication required)
Route::prefix('provider')->group(function () {
    // Authentication routes
    Route::post('/register', [ProviderAuthController::class, 'register']);
    Route::post('/login', [ProviderAuthController::class, 'login']);
    
    // Data validation routes
    Route::post('/check-email', [ProviderAuthController::class, 'checkEmail']);
    Route::post('/check-phone', [ProviderAuthController::class, 'checkPhone']);
    Route::post('/check-license', [ProviderAuthController::class, 'checkLicense']);
    
    // Reference data routes
    Route::get('/specializations', [ProviderAuthController::class, 'specializations']);
    Route::get('/practice-types', [ProviderAuthController::class, 'practiceTypes']);
});

// Provider protected routes (authentication required)
Route::prefix('provider')->middleware(['auth:provider'])->group(function () {
    Route::post('/logout', [ProviderAuthController::class, 'logout']);
    Route::get('/profile', [ProviderAuthController::class, 'profile']);
    Route::put('/profile', [ProviderAuthController::class, 'updateProfile']);
    
    // Patient management routes for providers
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);
    Route::put('/patients/{patient}', [PatientController::class, 'update']);
    Route::get('/patients-reference-data', [PatientController::class, 'referenceData']);
    
    // Availability management routes
    Route::get('/availability', [ProviderAvailabilityController::class, 'index']);
    Route::put('/availability', [ProviderAvailabilityController::class, 'update']);
    Route::delete('/availability/{id}', [ProviderAvailabilityController::class, 'destroy']);
    
    // Appointment slots routes
    Route::get('/slots', [AppointmentSlotController::class, 'index']);
    Route::post('/slots', [AppointmentSlotController::class, 'store']);
    Route::put('/slots/{id}', [AppointmentSlotController::class, 'update']);
    Route::delete('/slots/{id}', [AppointmentSlotController::class, 'destroy']);
    
    // Provider appointment management routes
    Route::get('/appointments', [\App\Http\Controllers\ProviderAppointmentController::class, 'index']);
    Route::put('/appointments/{id}/status', [\App\Http\Controllers\ProviderAppointmentController::class, 'updateStatus']);
    Route::get('/appointments/statistics', [\App\Http\Controllers\ProviderAppointmentController::class, 'statistics']);
    
    // Blocked days routes
    Route::get('/blocked-days', [BlockedDayController::class, 'index']);
    Route::post('/blocked-days', [BlockedDayController::class, 'store']);
    Route::put('/blocked-days/{id}', [BlockedDayController::class, 'update']);
    Route::delete('/blocked-days/{id}', [BlockedDayController::class, 'destroy']);
});

// Patient routes (no authentication required) 
Route::prefix('patient')->group(function () {
    // Authentication routes
    Route::post('/login', [PatientAuthController::class, 'login']);
});

// Patient protected routes (authentication required)
Route::prefix('patient')->middleware(['auth:patient'])->group(function () {
    Route::post('/logout', [PatientAuthController::class, 'logout']);
    Route::get('/profile', [PatientAuthController::class, 'profile']);

    // Patient can view provider availability
    Route::get('/provider/availability/{providerId}', [ProviderAvailabilityController::class, 'showForPatient']);
    Route::get('/provider/availability/{providerId}/by-date', [ProviderAvailabilityController::class, 'showForPatientDate']);

    // Patient appointment booking
    Route::get('/providers', [\App\Http\Controllers\PatientAppointmentController::class, 'listProviders']);
    Route::get('/providers/{providerId}/slots', [\App\Http\Controllers\PatientAppointmentController::class, 'listAvailableSlots']);
    Route::post('/appointments/book', [\App\Http\Controllers\PatientAppointmentController::class, 'book']);
    Route::get('/providers/{providerId}/generated-slots', [\App\Http\Controllers\PatientAppointmentController::class, 'generateSlots']);
    Route::post('/appointments/book-by-time', [\App\Http\Controllers\PatientAppointmentController::class, 'bookByTime']);
}); 