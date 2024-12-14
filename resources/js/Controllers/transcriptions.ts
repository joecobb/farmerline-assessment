import axios from "axios";

// Set Axios defaults
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Store a transcription
export const uploadAudioBlob = async (audioBlob: Blob, userId: any) => {
    const formData = new FormData();
    formData.append("audio_blob", audioBlob);
    formData.append("user_id", userId);

    const response = await axios.post("/api/v1/transcriptions", formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            "Content-Type": "multipart/form-data"
        },
    });
    return response.data;
};

// Get all transcriptions for a user
export const getTranscriptions = async (userId: any) => {
    const response = await axios.get(`/api/v1/transcriptions/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
    });
    return response.data.transcriptions;
};
