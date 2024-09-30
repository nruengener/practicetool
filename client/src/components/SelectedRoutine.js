import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SelectedRoutine = () => {
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSelectedRoutine = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/selected-routine');
        setSelectedRoutine(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('No routine is currently selected');
        } else {
          setError('An error occurred while fetching the selected routine');
        }
        setLoading(false);
      }
    };

    fetchSelectedRoutine();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!selectedRoutine) return <div>No routine selected</div>;

  return (
    <div>
      <h2>{selectedRoutine.name}</h2>
      {/* Render the rest of the routine details */}
    </div>
  );
};

export default SelectedRoutine;