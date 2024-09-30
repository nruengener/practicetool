import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useError } from '../ErrorContext';

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newRoutine, setNewRoutine] = useState({ name: '', entries: [] });
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showError, showNotification } = useError();

  useEffect(() => {
    fetchRoutines();
    fetchEntries();
  }, []);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/routines');
      setRoutines(response.data.routines);
    } catch (error) {
      showError('Error fetching routines. Please try again.');
      console.error('Error fetching routines:', error);
    }
    setLoading(false);
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/entries');
      if (response.data && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        console.error('Unexpected response format for entries:', response.data);
        setEntries([]);
      }
    } catch (error) {
      showError('Error fetching entries. Please try again.');
      console.error('Error fetching entries:', error);
      setEntries([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingRoutine) {
      setEditingRoutine({ ...editingRoutine, [name]: value });
    } else {
      setNewRoutine({ ...newRoutine, [name]: value });
    }
  };

  const handleEntrySelection = (e) => {
    const selectedEntries = Array.from(e.target.selectedOptions, option => option.value);
    if (editingRoutine) {
      setEditingRoutine({ ...editingRoutine, entries: selectedEntries });
    } else {
      setNewRoutine({ ...newRoutine, entries: selectedEntries });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRoutine) {
        const response = await axios.put(`/api/routines/${editingRoutine._id}`, editingRoutine);
        if (response.data) {
          // Update the local state immediately
          setRoutines(prevRoutines => 
            prevRoutines.map(routine => 
              routine._id === editingRoutine._id ? response.data : routine
            )
          );
          setEditingRoutine(null);
          showNotification('Routine updated successfully');
        }
      } else {
        const response = await axios.post('/api/routines', newRoutine);
        if (response.data) {
          // Add the new routine to the local state immediately
          setRoutines(prevRoutines => [...prevRoutines, response.data]);
          setNewRoutine({ name: '', entries: [] });
          showNotification('Routine created successfully');
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        showError(`Error saving routine: ${error.response.data.message}`);
      } else {
        showError('Error saving routine. Please try again.');
      }
      console.error('Error saving routine:', error);
    }
    setLoading(false);
  };

  const handleEdit = (routine) => {
    setEditingRoutine({
      _id: routine._id,
      name: routine.name,
      entries: routine.entries.map(entry => entry._id)
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/routines/${id}`);
        // Remove the deleted routine from the local state immediately
        setRoutines(prevRoutines => prevRoutines.filter(routine => routine._id !== id));
        showNotification('Routine deleted successfully');
      } catch (error) {
        showError('Error deleting routine. Please try again.');
        console.error('Error deleting routine:', error);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingRoutine(null);
    setNewRoutine({ name: '', entries: [] });
  };

  return (
    <div className="routines-page">
      <h2>Routines</h2>
      <form onSubmit={handleSubmit} className="routine-form">
        <input
          type="text"
          name="name"
          value={editingRoutine ? editingRoutine.name : newRoutine.name}
          onChange={handleInputChange}
          placeholder="Routine Name"
          required
        />
        <select
          multiple
          value={editingRoutine ? editingRoutine.entries : newRoutine.entries}
          onChange={handleEntrySelection}
          className="entry-select"
        >
          {Array.isArray(entries) && entries.map(entry => (
            <option key={entry._id} value={entry._id}>{entry.name}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {editingRoutine ? 'Update Routine' : 'Add Routine'}
        </button>
        {editingRoutine && (
          <button type="button" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </form>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <ul className="routine-list">
          {Array.isArray(routines) && routines.map((routine) => (
            <li key={routine._id} className="routine-item">
              <div className="routine-info">
                <h3>{routine.name}</h3>
                <ul className="routine-entries">
                  {Array.isArray(routine.entries) && routine.entries.map(entry => (
                    <li key={entry._id}>{entry.name}</li>
                  ))}
                </ul>
              </div>
              <div className="routine-actions">
                <button onClick={() => handleEdit(routine)}>Edit</button>
                <button onClick={() => handleDelete(routine._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoutinesPage;