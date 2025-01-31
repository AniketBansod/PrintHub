import React from 'react';
import  { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Settings, BarChart, LogOut, ToggleLeft, ToggleRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
const OverviewSection = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Users" value="1,234" />
      <StatCard title="Active Printers" value="15" />
      <StatCard title="Print Jobs Today" value="89" />
      <StatCard title="Revenue This Month" value="5,678 credits" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <QueuePredictionCard />
      <UrgentRequestsCard />
    </div>
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
    <h3 className="text-gray-400 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-amber-400">{value}</p>
  </div>
);

const QueuePredictionCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Queue Prediction</h3>
    <p className="text-gray-300 mb-2">Predicted peak times:</p>
    <ul className="list-disc list-inside text-amber-400">
      <li>Today: 2:00 PM - 4:00 PM</li>
      <li>Tomorrow: 10:00 AM - 12:00 PM</li>
    </ul>
    <p className="text-gray-300 mt-4">Suggested actions:</p>
    <ul className="list-disc list-inside text-green-400">
      <li>Increase staff during peak hours</li>
      <li>Encourage off-peak printing</li>
    </ul>
  </div>
);

const UrgentRequestsCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Urgent Requests</h3>
    <ul className="space-y-2">
      <li className="flex items-center justify-between bg-red-800 p-3 rounded-md">
        <span>Faculty Handouts - Due in 30 minutes</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-500 text-gray-900 px-3 py-1 rounded-md hover:bg-amber-400"
        >
          Prioritize
        </motion.button>
      </li>
      <li className="flex items-center justify-between bg-red-800 p-3 rounded-md">
        <span>Exam Papers - Due in 1 hour</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-500 text-gray-900 px-3 py-1 rounded-md hover:bg-amber-400"
        >
          Prioritize
        </motion.button>
      </li>
    </ul>
  </div>
);

export default OverviewSection; 