import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import AudioWave from './AudioWave';
import TranscriptionList from './TranscriptionList';
import { useEffect, useState } from 'react';
import { getTranscriptions } from '@/Controllers/transcriptions';

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const [transcriptions, setTranscriptions] = useState<any>([]);

    const getUserTranscriptions = async (userId: number) => {
        try {
            const response = await getTranscriptions(userId);
            setTranscriptions(response);
            console.log('Transcriptions result:', response);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getUserTranscriptions(user.id);
    }, []);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="h-[calc(100vh-64px)] bg-custom bg-no-repeat bg-cover bg-center overflow-y-scroll" >

                <div className="grid grid-cols-4 px-10">
                    <div className={`${transcriptions && transcriptions.length > 0 ? 'lg:col-span-3' : ''} col-span-4`}>
                        <AudioWave onUploadDone={() => {
                            getUserTranscriptions(user.id);
                        }} />
                    </div>
                    {transcriptions && transcriptions.length > 0 && <div className="lg:col-span-1 col-span-4">
                        <TranscriptionList transcriptions={transcriptions} />
                    </div>}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
