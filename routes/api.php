<?php

use App\Http\Controllers\TranscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::post('/transcriptions', [TranscriptionController::class, 'store']);
    Route::get('/transcriptions/{userId}', [TranscriptionController::class, 'index']);
});
