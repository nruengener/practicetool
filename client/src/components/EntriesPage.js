import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useError } from '../ErrorContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import './EntriesPage.css';

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ name: '', description: '', scheduledTime: '' });
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const { showError, showNotification } = useError();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/entries', {
        params: { sortBy }
      });
      console.log('Fetched entries:', response.data);
      if (response.data && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        console.error('Unexpected response format:', response.data);
        showError('Unexpected response format from server');
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching entries:', error.response || error);
      showError(`Error fetching entries: ${error.response?.data?.message || error.message}`);
      setEntries([]);
    }
    setLoading(false);
  }, [sortBy, showError]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'scheduledTime') {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue) || parsedValue < 1) return;
    }
    if (editingEntry) {
      setEditingEntry({ ...editingEntry, [name]: value });
    } else {
      setNewEntry({ ...newEntry, [name]: value });
    }
  };

  const validateEntry = (entry) => {
    if (!entry.name.trim()) {
      showError('Name is required.');
      return false;
    }
    if (!entry.scheduledTime || parseInt(entry.scheduledTime, 10) < 1) {
      showError('Scheduled time must be a positive integer.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entryToSave = editingEntry || newEntry;
    if (!validateEntry(entryToSave)) return;

    setLoading(true);
    try {
      if (editingEntry) {
        const response = await axios.put(`/api/entries/${editingEntry._id}`, editingEntry);
        console.log('Updated entry:', response.data);
        showNotification('Entry updated successfully');
      } else {
        const response = await axios.post('/api/entries', newEntry);
        console.log('Created entry:', response.data);
        showNotification('Entry created successfully');
      }
      
      // Refetch entries to ensure consistency with the server
      await fetchEntries();
      
      // Reset form state
      setEditingEntry(null);
      setNewEntry({ name: '', description: '', scheduledTime: '' });
    } catch (error) {
      console.error('Error saving entry:', error.response || error);
      showError(`Error saving entry: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setLoading(true);
      try {
        await axios.delete(`/api/entries/${id}`);
        await fetchEntries();
        showNotification('Entry deleted successfully');
      } catch (error) {
        console.error('Error deleting entry:', error.response || error);
        showError(`Error deleting entry: ${error.response?.data?.message || error.message}`);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingEntry(null);
    setNewEntry({ name: '', description: '', scheduledTime: '' });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="entries-page">
      <h2>Entries</h2>
      <div className="sort-control">
        <label htmlFor="sort-select">Sort by: </label>
        <select id="sort-select" value={sortBy} onChange={handleSortChange}>
          <option value="createdAt">Creation Date</option>
          <option value="name">Name</option>
        </select>
      </div>
      <form onSubmit={handleSubmit} className="entry-form">
        <input
          type="text"
          name="name"
          value={editingEntry ? editingEntry.name : newEntry.name}
          onChange={handleInputChange}
          placeholder="Entry Name"
          required
        />
        <input
          type="text"
          name="description"
          value={editingEntry ? editingEntry.description : newEntry.description}
          onChange={handleInputChange}
          placeholder="Description"
        />
        <input
          type="number"
          name="scheduledTime"
          value={editingEntry ? editingEntry.scheduledTime : newEntry.scheduledTime}
          onChange={handleInputChange}
          placeholder="Scheduled Time (minutes)"
          min="1"
          required
        />
        <button type="submit" disabled={loading}>
          {editingEntry ? 'Update Entry' : 'Add Entry'}
        </button>
        {editingEntry && (
          <button type="button" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </form>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry._id} className="entry-item">
              <div className="entry-info">
                <strong>{entry.name}</strong> - {entry.description} ({entry.scheduledTime} minutes)
                <br />
                <small>Created: {format(new Date(entry.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</small>
              </div>
              <div className="entry-actions">
                <button onClick={() => handleEdit(entry)}>Edit</button>
                <button onClick={() => handleDelete(entry._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EntriesPage;