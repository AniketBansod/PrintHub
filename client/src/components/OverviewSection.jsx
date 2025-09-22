import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

// The shimmer component is already responsive. No changes needed here.
const OverviewShimmer = () => (
  <div>
    <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

const OverviewSection = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    totalPrintJobsToday: 0,
    totalRevenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch(
          "http://localhost:5000/api/admin/overview",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
    const interval = setInterval(fetchOverview, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <OverviewShimmer />;
  
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">System Overview</h2>
      
      {/* Responsive Grid for Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Pending Requests" value={stats.pendingRequests} />
        <StatCard title="Print Jobs Today" value={stats.totalPrintJobsToday} />
        <StatCard
          title="Revenue This Month"
          value={`₹${stats.totalRevenueThisMonth.toFixed(2)}`}
        />
      </div>

      {/* Responsive Grid for Lower Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueuePredictionCard />
        <UrgentRequestsCard />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <h3 className="text-gray-500 dark:text-gray-400 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{value}</p>
  </div>
);

const QueuePredictionCard = () => {
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/queue-prediction", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setSlots(data))
      .catch(() => setSlots({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
        <Clock className="mr-2 h-5 w-5 text-blue-500" />
        Queue Prediction
      </h3>
      {Object.keys(slots).length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No busy slots detected</p>
      ) : (
        Object.entries(slots).map(([day, times]) => (
          <div key={day} className="mb-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{day}</p>
            <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 space-y-1">
              {Object.entries(times).map(([slot, count]) => (
                <li key={slot}>
                  <span className="text-gray-700 dark:text-gray-300">{slot} → {count} jobs</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

const UrgentRequestsCard = () => {
  const [urgent, setUrgent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/urgent-requests", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setUrgent(data))
      .catch(() => setUrgent([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
        Urgent Requests
      </h3>
      {urgent.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No urgent requests</p>
      ) : (
        <ul className="space-y-2">
          {urgent.map((order) => (
            <li
              key={order._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-red-800 dark:text-red-200"
            >
              <span className="break-all">
                {order.items[0]?.originalFilename || "Untitled File"}
                {" - Due "}
                {order.items[0]?.pickupTime
                  ? new Date(order.items[0].pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "N/A"}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-amber-500 text-gray-900 px-3 py-1 rounded-md hover:bg-amber-400 self-end sm:self-center flex-shrink-0"
              >
                Prioritize
              </motion.button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OverviewSection;

