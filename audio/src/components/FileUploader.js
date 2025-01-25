import React, { useState } from 'react';
import axios from 'axios';

export default function FileUploader({ onFileUpload, setAudioFiles, audioFiles }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      console.error('No file selected for upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post('http://localhost:5001/upload', formData, {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const response = await axios.get('http://localhost:3001/audioFiles');
      setAudioFiles(response.data);

      onFileUpload(uploadResponse.data);

    } catch (error) {
      console.error('Error uploading file:', error);
      // Обработка ошибок запроса
      if (error.response) {
        // Сервер вернул код ошибки, который не в диапазоне 2xx
        console.error('Server responded with a status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        // Запрос был сделан, но ответ не был получен
        console.error('No response received:', error.request);
      } else {
        // Произошла ошибка при настройке запроса
        console.error('Error setting up the request:', error.message);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button type="button" onClick={handleFileUpload}>Upload File</button>
      {uploadProgress > 0 && (
        <div>
          <progress value={uploadProgress} max="100">{uploadProgress}%</progress>
          <span>{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
}
