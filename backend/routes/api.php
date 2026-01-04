<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;

// User CRUD routes
Route::apiResource('users', UserController::class);

// Google OAuth routes
Route::prefix('auth/google')->group(function () {
    Route::get('redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
    Route::get('callback', [GoogleAuthController::class, 'callback'])->name('google.callback');
});
Route::get('auth/user', [GoogleAuthController::class, 'user'])->name('auth.user');
Route::post('auth/logout', [GoogleAuthController::class, 'logout'])->name('auth.logout');

// Registration routes
Route::post('registration/complete', [RegistrationController::class, 'complete'])->name('registration.complete');
Route::get('registration/status/{userId}', [RegistrationController::class, 'status'])->name('registration.status');