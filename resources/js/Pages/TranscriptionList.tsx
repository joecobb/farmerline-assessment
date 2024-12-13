import { format } from 'date-fns';

export default function TranscriptionList({ transcriptions }: { transcriptions: [] }) {
    return <div className="shadow bg-white rounded-md p-3 mt-9 mb-10 lg:mb-0 lg:h-[calc(100vh-160px)] ">
        <h2 className="mb-3 font-bold text-xl">Transcript</h2>
        <div className="lg:overflow-scroll lg:h-[calc(100vh-230px)]  ">
            {transcriptions.map((item: any) => {
                const formattedDate = format(new Date(item.created_at), "MMM d,yyyy h:mmaaa");
                return <div key={item.id} className="border rounded-md p-3 mb-4">
                    <div className="flex justify-end text-light-gray text-sm mb-2">
                        {formattedDate}
                    </div>
                    <div>
                        {item.transcription}
                    </div>
                </div>
            })}
        </div>


    </div>
}
