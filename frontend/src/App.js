import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import ReactSelect from 'react-select/creatable';
import { FiClock } from 'react-icons/fi';
import { FaDownload, FaFilePdf } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SerpApiUsageDashboard from './components/SerpApiUsageDashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [jobRole, setJobRole] = useState('dotnet');
  const [labels, setLabels] = useState([]);
  const [counts, setCounts] = useState([]);
  const [timestamp, setTimestamp] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobCount, setJobCount] = useState(10);
  const [topSkills, setTopSkills] = useState([]);
  const chartRef = useRef();
  

  const jobRoleOptions = [
    { value: 'dotnet', label: '.NET Developer' },
    { value: 'java', label: 'Java Developer' },
    { value: 'python', label: 'Python Developer' },
    { value: 'full-stack', label: 'Full Stack Developer' },
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'ai-engineer', label: 'AI Engineer' },
    { value: 'data-analyst', label: 'Data Analyst' },
    { value: 'cloud-engineer', label: 'Cloud Engineer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'qa-engineer', label: 'QA / Test Automation Engineer' },
    { value: 'sdet', label: 'SDET' },
    { value: 'cybersecurity', label: 'Cybersecurity Engineer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'software-engineer', label: 'Software Engineer I' },
    { value: 'business-analyst', label: 'Business Analyst' }
  ];

  

  useEffect(() => {
    if (jobRole) fetchSkills(jobRole);
  }, [jobRole, jobCount]);

  const fetchSkills = async (role) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.get(`${BASE_URL}/api/skills?role=${role}&limit=${jobCount}`);
      const { total_jobs, top_skills, timestamp } = response.data;

      const skillEntries = Object.entries(top_skills);
      skillEntries.sort((a, b) => b[1] - a[1]);

      const sortedLabels = skillEntries.map(([skill]) => skill);
      const sortedCounts = skillEntries.map(([, count]) => count);
      const top10 = sortedLabels.slice(0, 10);

      setLabels(sortedLabels);
      setCounts(sortedCounts);
      setTopSkills(top10);
      setTotalJobs(total_jobs);
      setTimestamp(new Date(timestamp).toLocaleString());
    } catch (err) {
      console.error('Error fetching skill data:', err);
      setLabels([]);
      setCounts([]);
      setTopSkills([]);
      setTotalJobs(0);
      setTimestamp('-');
    }
  };

  const handleRoleChange = (selectedOption) => {
    if (selectedOption) {
      setJobRole(selectedOption.value);
    } else {
      setLabels([]);
      setCounts([]);
      setTotalJobs(0);
      setTopSkills([]);
    }
  };

  const handleJobCountChange = (e) => {
    setJobCount(Number(e.target.value));
  };

  const getCategory = (skill) => {
    const backend = ['sql', 'api', 'mvc', 'asp.net', 'c#'];
    const frontend = ['react', 'angular', 'javascript', 'html', 'css'];
    const cloud = ['azure', 'aws', 'docker', 'kubernetes'];

    if (backend.includes(skill)) return 'backend';
    if (frontend.includes(skill)) return 'frontend';
    if (cloud.includes(skill)) return 'cloud';
    return 'other';
  };

  const getSkillBadge = (skill) => {
    const category = getCategory(skill);
    if (category === 'backend') return 'bg-red-200 text-red-800';
    if (category === 'frontend') return 'bg-yellow-200 text-yellow-800';
    if (category === 'cloud') return 'bg-blue-200 text-blue-800';
    return 'bg-gray-200 text-gray-800';
  };

  const getBarColor = (skill) => {
    const category = getCategory(skill);
    if (category === 'backend') return 'rgba(255, 99, 132, 0.6)';
    if (category === 'frontend') return 'rgba(255, 206, 86, 0.6)';
    if (category === 'cloud') return 'rgba(54, 162, 235, 0.6)';
    return 'rgba(201, 203, 207, 0.6)';
  };

  const downloadCSV = () => {
    const rows = labels.map((label, index) => `${label},${counts[index]}`);
    const csvContent = `data:text/csv;charset=utf-8,Skill,Count\n${rows.join("\n")}`;
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `${jobRole}_skills.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const input = chartRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: "landscape" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
      pdf.save(`${jobRole}_skills_report.pdf`);
    });
  };

  const copySkillsToClipboard = () => {
    const textToCopy = topSkills.join(', ');
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert("✅ Top skills copied to clipboard!"))
      .catch(err => console.error("❌ Failed to copy:", err));
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Skill Frequency',
        data: counts,
        backgroundColor: labels.map(label => getBarColor(label)),
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Top Skills for ${jobRole}` }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-8">
      <div className="w-full max-w-4xl bg-white p-6 rounded shadow">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Job Skills Analyzer</h1>

          <ReactSelect
            options={jobRoleOptions}
            onChange={handleRoleChange}
            isClearable
            placeholder="Select or type a job role..."
            className="mb-4 w-full sm:w-96"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: 'lightgray',
                boxShadow: 'none',
                '&:hover': { borderColor: '#888' }
              })
            }}
          />

          

          <div className="w-full text-left mb-6">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p><span role="img" aria-label="search">🔎</span> <strong>Job Role:</strong> {jobRole}</p>
            <p><span role="img" aria-label="jobs">📄</span> <strong>Jobs Fetched:</strong> {totalJobs}</p>
            <p>
              <span role="img" aria-label="skills">⭐</span> <strong>Top Skills:</strong>{' '}
              {topSkills.map((skill, index) => (
                <a
                  key={skill}
                  href={`https://www.google.com/search?q=${encodeURIComponent(skill + ' developer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block text-sm px-2 py-1 rounded mx-1 ${getSkillBadge(skill)} hover:underline`}
                  title="Click to search"
                >
                  {skill}{index < topSkills.length - 1 ? ',' : ''}
                </a>
              ))}
              <button 
                onClick={copySkillsToClipboard} 
                className="ml-2 text-blue-600 text-sm underline hover:text-blue-800"
              >
                (Copy Skills)
              </button>
            </p>
            <p className="text-sm text-gray-600 mt-2"><FiClock className="inline-block mr-1" />Updated: {timestamp}</p>
          </div>

          <div className="w-full flex justify-center mt-6">
            <div ref={chartRef} className="w-[80%] max-w-[800px] bg-white p-4 rounded shadow">
              <Bar data={chartData} options={chartOptions} />

              <div className="mt-4 text-sm text-gray-700">
  <p className="font-semibold mb-2">🎨 <span className="text-black">Color Legend:</span></p>
  <div className="flex flex-wrap gap-6">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(243, 14, 64, 0.6)' }}></div>
      <span className="text-sm text-gray-800">Backend - Red</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 206, 86, 0.6)' }}></div>
      <span className="text-sm text-gray-800">Frontend - Yellow</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(54, 162, 235, 0.6)' }}></div>
      <span className="text-sm text-gray-800">Cloud  - Blue</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(201, 203, 207, 0.6)' }}></div>
      <span className="text-sm text-gray-800">Other - Gray</span>
    </div>
  </div>
</div>




            </div>
          </div>

          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={downloadCSV}
              className="flex items-center bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              <FaDownload className="mr-2" /> Download CSV
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
            >
              <FaFilePdf className="mr-2" /> Export PDF
            </button>
          </div>

              {/* <div><SerpApiUsageDashboard /></div> */}

        </div>
      </div>
    </div>
  );
}

export default App;
