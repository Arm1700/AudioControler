import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

function App() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [notes, setNotes] = useState({});
  const [newNames, setNewNames] = useState({});
  const [startTime, setStartTime] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3001/audioFiles')
      .then(response => {
        setAudioFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching audio files:', error);
      });
  }, []);

  const handleFileUploadSuccess = (fileInfo) => {
    console.log('File uploaded successfully:', fileInfo);
    // Дополнительные действия после успешной загрузки файла
  };

  const handleRename = async (file, newName) => {
    try {
      const response = await axios.patch(`http://localhost:5001/rename`, { ...file, name: newName });
      console.log('Rename successful:', response);
      axios.get('http://localhost:3001/audioFiles')
        .then(response => {
          setAudioFiles(response.data);
        })
        .catch(error => {
          console.error('Error fetching audio files:', error);
        });
      // Обновите состояние audioFiles здесь, если необходимо
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleDelete = async (file) => {
    const response = await axios.post(`http://localhost:5001/delete`, { ...file });
    axios.get('http://localhost:3001/audioFiles')
      .then(response => {
        setAudioFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching audio files:', error);
      });
    console.log('Delete successful:', response);

  };

  const handleNoteChange = (file, note) => {
    setNotes(prev => ({ ...prev, [file.name]: note }));
  };

  const handleStartTimeChange = (file, time) => {
    setStartTime(prev => ({ ...prev, [file.name]: time }));
  };

  const handleRenameChange = (file, newName) => {
    setNewNames(prev => ({ ...prev, [file.name]: newName }));
  };

  const playFromTime = (file) => {
    const time = startTime[file.name] || 0;
    setSelectedAudio(`http://localhost:3001${file.url}`)
    
  };

  return (
    <div className="App text-red-500 bg-red-500">
      <FileUploader setAudioFiles={setAudioFiles} audioFiles={audioFiles} onFileUpload={handleFileUploadSuccess} />
      <div>
        <h2 className='text-red-500'>Available Audio Files</h2>
        <ul className='audio-list'>
          {audioFiles.map(file => (
            <li key={file.name} className='audio-list-item'>
              {file.name}
              <section className='section'>
                <label className='label'>Rename
                  <input
                    type="text"
                    placeholder="New name"
                    value={newNames[file.name] || ''}
                    onChange={(e) => handleRenameChange(file, e.target.value)}
                  />
                  <button onClick={() => handleRename(file, newNames[file.name] || '')}>Rename</button>
                </label>
                <label className='label'>Note
                  <input type="text" placeholder="Add a note" onBlur={(e) => handleNoteChange(file, e.target.value)} />
                  <button onClick={(e) => handleNoteChange(file, e.target.value)}>Add note</button>
                </label>
                <label className='label'>Start time
                  <input type="number" placeholder="Start time (seconds)" onBlur={(e) => handleStartTimeChange(file, e.target.value)} />
                  <button onClick={(e) => handleStartTimeChange(file, e.target.value)}>Add start time</button>
                </label>
                <div className='buttons'>
                  <button onClick={() => handleDelete(file)}>Delete</button>
                  <button onClick={() => playFromTime(file)}>Play from time</button>
                </div>
              </section>
            </li>
          ))}
        </ul>
      </div>
      {selectedAudio && (
        <AudioPlayer
          src={selectedAudio}
          onPlay={e => console.log("onPlay")}
          controls
          autoPlay
        />
      )}
    </div>
  );
}

export default App;
