<?php

use App\Http\Controllers\TranscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/transcriptions', [TranscriptionController::class, 'store']);
    Route::get('/transcriptions/{userId}', [TranscriptionController::class, 'index']);
})->middleware('auth:sanctum');
