import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { uploadAudioBlob } from '@/Controllers/transcriptions';
import { Head, usePage } from '@inertiajs/react';
import { closeLoadingAlert, showLoadingAlert } from '@/Controllers/utils';
import Swal from 'sweetalert2';



const AudioWave = ({ onUploadDone }: any) => {
    const user = usePage().props.auth.user;

    const waveformRef = useRef<any>(null);
    const soundWaveRef = useRef<any>(null);

    const [mic, setMic] = useState<any>();
    const [progress, setProgress] = useState("00:00");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordPlugin, setRecordPlugin] = useState<any>();
    const [waveSurfer, setWaveSurfer] = useState<any>();

    // Threshold and silence detection parameters
    const silenceThreshold = 0.04; // Amplitude threshold to consider as silence
    const silenceDuration = 2; // Duration in seconds to detect silence
    let silenceStartTime: any = null; // To track when silence starts
    let silenceDetected = false;
    let silenceDetectionInterval: any = null;

    // Function to detect silence during recording
    const detectSilence = () => {
        // Get the peaks from the recorded audio
        const peaks = waveSurfer.exportPeaks()[0];

        // Set the time window based on peaks' length and the sample rate
        const sampleRate = peaks.length / waveSurfer.getDuration();
        const secondsPerSample = 1 / sampleRate;

        // Define the number of samples corresponding to 4 seconds
        const samplesForSilence = Math.floor(silenceDuration / secondsPerSample);

        // Check the most recent `samplesForSilence` values in the peaks array
        const recentPeaks = peaks.slice(-samplesForSilence);

        // Check if all values in the `recentPeaks` are below the silence threshold
        const isSilent = recentPeaks.every((value: any) => value < silenceThreshold);

        if (isSilent) {
            if (!silenceStartTime) {
                silenceStartTime = Date.now(); // Mark when silence starts
                console.log("Silence detected, starting timer...");
            } else if (Date.now() - silenceStartTime >= silenceDuration * 1000) {
                if (!silenceDetected) {
                    silenceDetected = true;
                    console.log(`Silence of ${silenceDuration} seconds detected!`);
                    recordPlugin.stopRecording();
                    // Trigger any action when silence is detected
                }
            }
        } else {
            silenceStartTime = null; // Reset silence start time
            silenceDetected = false; // Reset silence detection
        }
    };

    // Run the silence detection periodically
    const startSilenceDetection = () => {
        silenceDetectionInterval = setInterval(() => {
            detectSilence(); // Check for silence every 2 seconds
        }, 2000);
    };

    const clearSilenceDetectionInterval = () => {
        if (silenceDetectionInterval) {
            clearInterval(silenceDetectionInterval);
            silenceDetectionInterval = null;
        }
    }



    const checkRecordingStatus = (time: number) => {
        const duration = time / 1000; // Convert milliseconds to seconds
        if (duration >= 15) {
            recordPlugin.stopRecording();
        }
    };



    const handleAudioSubmission = async (blob: Blob) => {

        if (isTranscribing) return;

        setIsTranscribing(true);

        try {
            showLoadingAlert('Transcribing audio...');
            const response = await uploadAudioBlob(blob, user.id);
            console.log('Transcription result:', response.data);
            onUploadDone();
        } catch (error) {
            console.error('Error during transcription:', error);
        } finally {
            setIsTranscribing(false);
            closeLoadingAlert();
        }
    };

    const updateProgress = (time: any) => {
        const formattedTime = [
            Math.floor((time % 3600000) / 60000),
            Math.floor((time % 60000) / 1000),
        ]
            .map((v) => (v < 10 ? '0' + v : v))
            .join(':');
        setProgress(formattedTime);
    };

    useEffect(() => {
        let wavesurfer: any, record: any;

        const createWaveSurfer = () => {
            setProgress("00:00");

            // Create a new Wavesurfer instance
            wavesurfer = WaveSurfer.create({
                container: soundWaveRef.current,
                waveColor: '#030303',
                progressColor: 'rgb(100, 0, 100)',
                barGap: 3,
                barWidth: 5,
                barRadius: 5,
                barHeight: 2,
                backend: 'MediaElement',
                minPxPerSec: 100,
            });


            // Initialize the Record plugin
            record = wavesurfer.registerPlugin(
                RecordPlugin.create({
                    renderRecordedAudio: false,
                    scrollingWaveform: true,
                    continuousWaveform: false,
                }),
            );

            setWaveSurfer(wavesurfer);
            setRecordPlugin(record);

        };




        // Mic selection
        RecordPlugin.getAvailableAudioDevices().then((availableMics: any) => {
            if (availableMics.length == 0) {
                Swal.fire({
                    title: "Error",
                    text: "Please make sure a mic is connected",
                    icon: "error"
                });
                return;
            }
            setMic(availableMics[0].deviceId);
        });

        createWaveSurfer();

        return () => {
            if (waveformRef.current) {
                waveformRef.current.destroy();
            }
            if (wavesurfer) {
                wavesurfer.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (recordPlugin) {


            recordPlugin.on('record-start', (time: any) => {
                startSilenceDetection();
                console.log("started");
            });

            recordPlugin.on('record-progress', (time: any) => {
                updateProgress(time);
                checkRecordingStatus(time);
            });

            recordPlugin.on('record-end', (blob: Blob) => {
                setIsRecording(false);
                clearSilenceDetectionInterval();
                handleAudioSubmission(blob);
            });
        }

    }, [recordPlugin]);

    return (
        <div className="text-center pt-20">
            {!isRecording && <h1 className="text-5xl">Welcome to Darli</h1>}
            {!isRecording && <button onClick={() => {
                // Get selected device
                recordPlugin.startRecording({ deviceId: mic }).then(() => {
                    setIsRecording(true);
                });
            }} className="bg-dark text-white px-6 py-3 rounded-lg mt-4">Start Transcription</button>}


            <div className="mx-auto max-w-[250px] lg:max-w-[500px]  lg:mt-32" ref={soundWaveRef} style={{ borderRadius: 4 }}></div>

            {isRecording && <button onClick={() => {
                recordPlugin.stopRecording();
                setIsRecording(false);
            }} className="bg-white w-10 h-10 shadow rounded-xl flex justify-center items-center mx-auto lg:mt-52 mt-28"><img className="w-[24px] h-[24px]" src="/images/close.png" alt="close" /></button>}
        </div>
    );
};

export default AudioWave;
