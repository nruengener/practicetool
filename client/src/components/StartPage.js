import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';
import { useError } from '../ErrorContext';
import './StartPage.css';

const API_BASE_URL = '/api';

const Timer = ({ entry, onTimeUpdate }) => {
  const { showNotification } = useError(); // Access showNotification within Timer
  const audioRef = useRef(new Audio('/audio/alarm.mp3')); // Initialize audio reference
  const hasCompletedRef = useRef(false); // Ref to prevent multiple completions

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          // Check if the new time has reached or exceeded the scheduled time and prevent duplicate completions
          if (newTime >= entry.scheduledTime * 60 && !hasCompletedRef.current) {
            clearInterval(interval);
            setIsRunning(false);
            hasCompletedRef.current = true; // Mark as completed to prevent re-entry
            console.log(`Timer completed for entry ${entry._id}: ${newTime} seconds`);
            onTimeUpdate(entry._id, Math.round(newTime / 60)); // Convert seconds to minutes
            console.log(`Calling onTimeUpdate for entry ${entry._id} with time ${Math.round(newTime / 60)} minutes`);
            showNotification(`${entry.name} timer completed!`);
            audioRef.current.play().catch((error) => {
              console.error(`Audio playback failed for entry ${entry._id}:`, error);
            }); // Play audio notification with error handling
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, entry, onTimeUpdate, showNotification]); // Added showNotification to dependencies

  const handleStart = () => setIsRunning(true);

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    hasCompletedRef.current = false; // Reset the completion flag
    console.log(`Timer reset for entry ${entry._id}`);
  };

  const handleStop = () => {
    setIsRunning(false);
    console.log(`Timer stopped for entry ${entry._id} at ${Math.round(time / 60)} minutes`);
    onTimeUpdate(entry._id, Math.round(time / 60)); // Convert seconds to minutes
    hasCompletedRef.current = true; // Prevent completion logic if stopping manually
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (time / (entry.scheduledTime * 60)) * 100;

  return (
    <div className="timer">
      <div className="timer-info">
        <h4 className="entry-name">{entry.name}</h4>
        <p className="time-display">{formatTime(time)} / {formatTime(entry.scheduledTime * 60)}</p>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
      </div>
      <div className="timer-controls">
        {!isRunning && <button className="start" onClick={handleStart}>Start</button>}
        {isRunning && <button className="pause" onClick={handlePause}>Pause</button>}
        <button className="reset" onClick={handleReset}>Reset</button>
        <button className="stop" onClick={handleStop}>Stop</button>
      </div>
    </div>
  );
};

const StartPage = () => {
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showNotification } = useError();

  const fetchSelectedRoutine = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/selected-routine`);
      console.log('Selected routine response:', response.data); // Debug log
      if (response.status === 404 || !response.data) {
        setSelectedRoutine(null);
      } else {
        setSelectedRoutine(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSelectedRoutine(null);
      } else {
        showError('Error fetching selected routine. Please try again.');
        console.error('Error fetching selected routine:', error);
      }
    }
    setLoading(false);
  }, [showError]);

  const fetchRoutines = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/routines`);
      console.log('Routines API response:', response.data);
      if (response.data && Array.isArray(response.data.routines)) {
        setRoutines(response.data.routines);
      } else {
        console.error('Unexpected data structure for routines:', response.data);
        setRoutines([]);
      }
    } catch (error) {
      showError('Error fetching routines. Please try again.');
      console.error('Error fetching routines:', error);
      setRoutines([]);
    }
  }, [showError]);

  useEffect(() => {
    fetchSelectedRoutine();
    fetchRoutines();
  }, [fetchSelectedRoutine, fetchRoutines]);

  const handleRoutineSelect = async (event) => {
    const routineId = event.target.value;
    if (!routineId) {
      // If the "Select a routine" option is chosen, do nothing
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/selected-routine/${routineId}/select`);
      await fetchSelectedRoutine();
      showNotification('Routine selected successfully');
    } catch (error) {
      showError('Error selecting routine. Please try again.');
      console.error('Error selecting routine:', error);
    }
    setLoading(false);
  };

  const handleTimeUpdate = useCallback(async (entryId, time) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/selected-routine/entry/${entryId}/add-time`, { time });
      console.log('Time update response:', response.data); // Add this line for debugging
      if (response.data && response.data.message) {
        showNotification(response.data.message);
        await fetchSelectedRoutine(); // Refresh the selected routine after updating time
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      showError(`Error recording time: ${error.message}`);
      console.error('Error recording time:', error);
    }
  }, [fetchSelectedRoutine, showError, showNotification]);

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="start-page">
      <h2>Start Page</h2>
      <div className="routine-selector">
        <label htmlFor="routine-select">Select a routine:</label>
        <select 
          id="routine-select"
          onChange={handleRoutineSelect}
          value={selectedRoutine ? selectedRoutine.routine._id : ''}
        >
          <option value="" disabled>Select a routine</option>
          {routines.map((routine) => (
            <option key={routine._id} value={routine._id}>
              {routine.name}
            </option>
          ))}
        </select>
      </div>
      {selectedRoutine && selectedRoutine.routine && selectedRoutine.routine.entries && (
        <div className="selected-routine">
          <h3>{selectedRoutine.routine.name}</h3>
          <div className="timers">
            {selectedRoutine.routine.entries.map((entry) => (
              <Timer key={entry._id} entry={entry} onTimeUpdate={handleTimeUpdate} />
            ))}
          </div>
        </div>
      )}
      {selectedRoutine && (!selectedRoutine.routine || !selectedRoutine.routine.entries || selectedRoutine.routine.entries.length === 0) && (
        <div className="selected-routine">
          <h3>{selectedRoutine.routine ? selectedRoutine.routine.name : 'Selected Routine'}</h3>
          <p>No entries found for this routine.</p>
        </div>
      )}
    </div>
  );
};

export default StartPage;