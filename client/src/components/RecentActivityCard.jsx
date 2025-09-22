import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Loader2, CheckCircle } from "lucide-react"

const RecentActivityCard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login to view activity");
        }

        const response = await fetch("http://localhost:5000/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const orders = await response.json();

        const activityList = [];
        orders.slice(0, 5).forEach((order) => {
          order.items.forEach((item) => {
            activityList.push({
              id: `${order.orderId}-${item.file}`,
              description: `Printed ${item.originalFilename || item.file}`,
              timestamp: new Date(order.orderDate),
              status: order.status,
              icon: CheckCircle,
              color:
                order.status === "completed"
                  ? "text-green-500"
                  : "text-amber-500",
            });
          });
        });

        activityList.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(activityList.slice(0, 3));
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-2 sm:mr-3">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500 mb-2 sm:mb-0 sm:mr-2" />
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Loading activity...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3 sm:mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-2 sm:mr-3">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4 text-sm sm:text-base">
          <p>Error loading activity: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-2 sm:mr-3">
          <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Recent Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm sm:text-base">No recent activity</p>
          <p className="text-xs sm:text-sm">
            Your recent print jobs will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center mb-2 sm:mb-0">
                  <IconComponent
                    className={`h-4 w-4 mr-2 ${activity.color}`}
                  />
                  <span className="text-sm sm:text-base text-gray-900 dark:text-gray-100">
                    {activity.description}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivityCard;
