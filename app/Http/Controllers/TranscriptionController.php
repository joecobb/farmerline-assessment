<?php

namespace App\Http\Controllers;

use App\Models\Transcription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscriptionController extends Controller
{
    public function store(Request $request)
    {
        // var_dump($request->file('audio_blob'));
        $request->validate([
            // 'audio_blob' => 'required|file|mimes:audio/webm;codecs=opus,audio/mpeg,mp3,wav',
            'user_id' => 'required|integer',
        ]);

        // Save audio file
        $filePath = $request->file('audio_blob')->store('audio_blobs', 'public');
        $audioUrl = Storage::url($filePath);

        // Transcribe audio using Whisper API
        $apiKey = env('WHISPER_API_KEY');
        $response = Http::withHeaders([
            'Authorization' => "Bearer $apiKey",
        ])->attach(
            'file', fopen(storage_path('app/public/' . $filePath), 'r')
        )->attach(
            'model', 'whisper-1'
        )->post('https://api.openai.com/v1/audio/transcriptions');

        if (!$response->ok()) {
            // Log the entire response for debugging
            Log::error('Whisper API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            // Return a detailed error response
            return response()->json([
                'error' => 'Transcription failed',
                'status' => $response->status(),
                'message' => $response->json('error.message') ?? 'Unknown error occurred',
                'details' => $response->json(),
            ], 500);

        }

        Log::info('Whisper API Response', [
            'body' => $response->body(),
        ]);
        $transcriptionText = $response->json()['text'] ?? '';

        // Save transcription in database
        $transcription = Transcription::create([
            'user_id' => $request->user_id,
            'audio_path' => $audioUrl,
            'transcription' => $transcriptionText,
        ]);

        return response()->json([
            'message' => 'Audio uploaded and transcribed successfully',
            'transcription' => $transcription,
        ]);
    }

    public function index($userId)
    {
        $transcriptions = Transcription::where('user_id', $userId)->get();

        return response()->json([
            'transcriptions' => $transcriptions,
        ]);
    }
}
