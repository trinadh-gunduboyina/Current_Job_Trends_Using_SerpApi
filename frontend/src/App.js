// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [jobRole, setJobRole] = useState('dotnet');
  const [labels, setLabels] = useState([]);
  const [counts, setCounts] = useState([]);

  const jobRoles = [
    { id: 'dotnet', label: '.NET Developer' },
    { id: 'java', label: 'Java Developer' },
    { id: 'data-analyst', label: 'Data Analyst' },
    { id: 'ai-engineer', label: 'AI Engineer' },
    { id: 'full-stack', label: 'Full Stack Developer' },
    { id: 'software-engineer', label: 'Software Engineer I' }
  ];

  useEffect(() => {
    fetchSkills(jobRole);
  }, [jobRole]);

  const fetchSkills = async (role) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/skills?role=${role}`);
      const data = response.data;
      setLabels(Object.keys(data));
      setCounts(Object.values(data));
    } catch (err) {
      console.error('Error fetching skill data:', err);
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Skill Frequency',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `Top Skills for ${jobRoles.find(j => j.id === jobRole)?.label}`
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Job Skills Analyzer</h1>
        <select
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="mb-6 p-2 border rounded"
        >
          {jobRoles.map(role => (
            <option key={role.id} value={role.id}>{role.label}</option>
          ))}
        </select>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default App;
