// src/components/SerpApiUsageDashboard.jsx
import React, { useEffect, useState } from 'react';

const SerpApiUsageDashboard = () => {
  const limit = 100;
  const [used, setUsed] = useState(() => {
    const stored = localStorage.getItem('serpapi_usage');
    return stored ? parseInt(stored) : 0;
  });

  const incrementUsage = () => {
    const next = used + 1;
    setUsed(next);
    localStorage.setItem('serpapi_usage', next.toString());
  };

  const usagePercent = Math.min((used / limit) * 100, 100);
  const usageColor = usagePercent > 80 ? 'bg-red-600' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">SerpAPI Usage</h2>
      <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
        <div className={`h-full ${usageColor}`} style={{ width: `${usagePercent}%` }}></div>
      </div>
      <p className="text-center text-sm mb-2">{used} / {limit} calls used</p>
      {usagePercent >= 80 && (
        <p className="text-center text-red-600 text-sm font-semibold">
          ⚠️ You are nearing the API limit!
        </p>
      )}
      <button
        onClick={incrementUsage}
        className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Simulate API Call
      </button>
    </div>
  );
};

export default SerpApiUsageDashboard;
