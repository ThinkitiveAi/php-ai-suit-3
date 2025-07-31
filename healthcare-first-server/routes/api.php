<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ProviderAuthController;
use App\Http\Controllers\Auth\PatientAuthController;
use App\Http\Controllers\PatientController;

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
Route::prefix('provider')->middleware(['auth:sanctum,provider'])->group(function () {
    Route::post('/logout', [ProviderAuthController::class, 'logout']);
    Route::get('/profile', [ProviderAuthController::class, 'profile']);
    Route::put('/profile', [ProviderAuthController::class, 'updateProfile']);
    
    // Patient management routes for providers
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);
    Route::put('/patients/{patient}', [PatientController::class, 'update']);
    Route::get('/patients-reference-data', [PatientController::class, 'referenceData']);
});

// Patient routes (no authentication required) 
Route::prefix('patient')->group(function () {
    // Authentication routes
    Route::post('/login', [PatientAuthController::class, 'login']);
});

// Patient protected routes (authentication required)
Route::prefix('patient')->middleware(['auth:sanctum,patient'])->group(function () {
    Route::post('/logout', [PatientAuthController::class, 'logout']);
    Route::get('/profile', [PatientAuthController::class, 'profile']);
}); 