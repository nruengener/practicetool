import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useError } from '../ErrorContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const OverviewPage = () => {
  const [entryRecords, setEntryRecords] = useState([]);
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const { showError } = useError();

  useEffect(() => {
    fetchEntryRecords();
  }, [dateRange]);

  const fetchEntryRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/entry-records/${dateRange}`);
      if (Array.isArray(response.data)) {
        setEntryRecords(response.data);
      } else {
        throw new Error('Unexpected data format received');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showError('No entry records found for the selected date range.');
      } else {
        showError(`Error fetching entry records: ${error.message || 'Unknown error'}`);
      }
      console.error('Error fetching entry records:', error);
      setEntryRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const processDataForBarChart = () => {
    const dataMap = {};
    entryRecords.forEach(record => {
      if (record && record.date && record.entry && record.entry.name && record.totalTime) {
        const date = new Date(record.date).toLocaleDateString();
        if (!dataMap[date]) {
          dataMap[date] = {};
        }
        dataMap[date][record.entry.name] = (dataMap[date][record.entry.name] || 0) + record.totalTime;
      }
    });

    return Object.entries(dataMap).map(([date, entries]) => ({
      date,
      ...entries
    }));
  };

  const processDataForPieChart = () => {
    const dataMap = {};
    entryRecords.forEach(record => {
      if (record && record.entry && record.entry.name && record.totalTime) {
        dataMap[record.entry.name] = (dataMap[record.entry.name] || 0) + record.totalTime;
      }
    });

    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  };

  const barChartData = processDataForBarChart();
  const pieChartData = processDataForPieChart();

  const totalTime = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="overview-page">
      <h2>Overview</h2>
      <div className="date-range-selector">
        <label htmlFor="date-range">Select date range:</label>
        <select
          id="date-range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>
      {barChartData.length > 0 ? (
        <div className="charts">
          <div className="chart">
            <h3>Time Spent on Entries</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(barChartData[0] || {}).filter(key => key !== 'date').map((entry, index) => (
                  <Bar key={entry} dataKey={entry} fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart">
            <h3>Distribution of Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p>No data available for the selected date range.</p>
      )}
      <div className="summary">
        <h3>Summary</h3>
        <p>Total time spent: {Math.floor(totalTime / 60)} hours {totalTime % 60} minutes</p>
        <ul>
          {pieChartData.map(entry => (
            <li key={entry.name}>
              {entry.name}: {Math.floor(entry.value / 60)} hours {entry.value % 60} minutes
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewPage;