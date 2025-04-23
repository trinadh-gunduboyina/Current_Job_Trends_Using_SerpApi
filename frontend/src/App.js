// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import ReactSelect from 'react-select/creatable';
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

  const jobRoleOptions = [
    { value: 'dotnet', label: '.NET Developer' },
    { value: 'java', label: 'Java Developer' },
    { value: 'data-analyst', label: 'Data Analyst' },
    { value: 'ai-engineer', label: 'AI Engineer' },
    { value: 'full-stack', label: 'Full Stack Developer' },
    { value: 'software-engineer', label: 'Software Engineer I' }
  ];

  useEffect(() => {
    if (jobRole) fetchSkills(jobRole);
  }, [jobRole]);

  const fetchSkills = async (role) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/skills?role=${role}`);
      const data = response.data;
      setLabels(Object.keys(data));
      setCounts(Object.values(data));
    } catch (err) {
      console.error('Error fetching skill data:', err);
      setLabels([]);
      setCounts([]);
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Skill Frequency',
        data: counts,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Top Skills for ${jobRole}` }
    }
  };

  const handleRoleChange = (selectedOption) => {
    if (selectedOption) {
      setJobRole(selectedOption.value);
    } else {
      setLabels([]);
      setCounts([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-8">
      <div className="w-full max-w-4xl bg-white p-6 rounded shadow">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Job Skills Analyzer</h1>

          <ReactSelect
            options={jobRoleOptions}
            onChange={handleRoleChange}
            isClearable
            placeholder="Select or type a job role..."
            className="mb-6 w-full sm:w-80"
          />

          <div className="w-full flex justify-center">
            <div className="w-full max-w-xl">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;