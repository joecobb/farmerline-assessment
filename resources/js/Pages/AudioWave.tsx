import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { uploadAudioBlob } from '@/Controllers/transcriptions';
import { Head, usePage } from '@inertiajs/react';
import { closeLoadingAlert, showLoadingAlert } from '@/Controllers/utils';



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


    let silenceTimer: any = null;
    const silenceDuration = 3000; // 3 seconds of silence to stop recording
    const silenceThreshold = 0.02;

    function clearSilenceTimer() {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    }

    const startSilenceDetection = () => {

        const analyser = waveSurfer.backend.getAnalyserNode();
        const dataArray = new Uint8Array(analyser.fftSize);

        const detectSilence = () => {
            analyser.getByteTimeDomainData(dataArray);

            // Check if the average volume is below the threshold
            const averageVolume = dataArray.reduce((sum, value) => sum + Math.abs(value - 128), 0) / dataArray.length;
            const isSilent = averageVolume < silenceThreshold * 128;

            if (isSilent) {
                if (!silenceTimer) {
                    silenceTimer = setTimeout(() => {
                        console.log('Silence detected, stopping recording');
                        recordPlugin.stop();
                    }, silenceDuration);
                }
            } else {
                clearSilenceTimer();
            }

            // Continue checking if recording is active
            if (recordPlugin.isRecording()) {
                requestAnimationFrame(detectSilence);
            }
        };

        detectSilence();
    }



    const checkRecordingStatus = (time: number) => {
        const duration = time / 1000; // Convert milliseconds to seconds
        if (duration >= 15) {
            recordPlugin.stopRecording();
        }
    };



    const handleAudioSubmission = async (blob: Blob) => {
        debugger;
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
                audioRate: 10,
            });

            // Initialize the Record plugin
            record = wavesurfer.registerPlugin(
                RecordPlugin.create({
                    renderRecordedAudio: false,
                    scrollingWaveform: true,
                    continuousWaveform: false,
                    continuousWaveformDuration: 30, // optional
                }),
            );

            setWaveSurfer(wavesurfer);
            setRecordPlugin(record);

        };




        // Mic selection
        RecordPlugin.getAvailableAudioDevices().then((availableMics: any) => {
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
                // startSilenceDetection();
            });

            recordPlugin.on('record-progress', (time: any) => {
                updateProgress(time);
                checkRecordingStatus(time);
            });

            recordPlugin.on('record-end', (blob: Blob) => {
                setIsRecording(false);
                // clearSilenceTimer();
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


            <div className="mx-auto max-w-[250px] lg:max-w-[500px] w-full lg:mt-32" ref={soundWaveRef} style={{ borderRadius: 4 }}></div>



            {isRecording && <button onClick={() => {
                recordPlugin.stopRecording();
                setIsRecording(false);

            }} className="bg-white w-10 h-10 shadow rounded-xl flex justify-center items-center mx-auto lg:mt-52 mt-28"><img className="w-[24px] h-[24px]" src="/images/close.png" alt="close" /></button>}
        </div>
    );
};

export default AudioWave;
