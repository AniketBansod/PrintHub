import { useState, useEffect } from "react"
import { API } from "../lib/api"
import { motion } from "framer-motion"
import { Clock, FileText, Calendar, Loader2, AlertCircle } from "lucide-react"

const UpcomingPrintsCard = () => {
  const [upcomingPrints, setUpcomingPrints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingPrints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view upcoming prints');
        }

        const response = await fetch(`${API}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();

        const upcoming = [];
        orders.forEach(order => {
          if (order.status === 'pending' || order.status === 'processing') {
            order.items.forEach(item => {
              upcoming.push({
                id: `${order.orderId}-${item.file}`,
                fileName: item.file,
                status: order.status,
                orderDate: new Date(order.orderDate),
                pickupTime: item.pickupTime ? new Date(item.pickupTime) : null,
                urgency: item.urgency || 'Normal'
              });
            });
          }
        });

        const urgencyOrder = { 'Express': 0, 'Urgent': 1, 'Normal': 2 };
        upcoming.sort((a, b) => {
          const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          if (a.pickupTime && b.pickupTime) return a.pickupTime - b.pickupTime;
          return b.orderDate - a.orderDate;
        });

        setUpcomingPrints(upcoming.slice(0, 3));
      } catch (err) {
        console.error('Error fetching upcoming prints:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingPrints();
  }, []);

  const getStatusText = (status, pickupTime, urgency) => {
    if (status === 'processing') return 'Currently processing';
    if (pickupTime) {
      const now = new Date();
      const diffHours = Math.floor((pickupTime - now) / (1000 * 60 * 60));
      return diffHours < 24
        ? `Ready for pickup in ${diffHours} hours`
        : `Scheduled for ${pickupTime.toLocaleDateString()}`;
    }
    return urgency === 'Express'
      ? 'Queued - Express (2-4 hours)'
      : urgency === 'Urgent'
      ? 'Queued - Urgent (Same day)'
      : 'Queued - Normal (24-48 hours)';
  };

  const getStatusColor = (status) =>
    status === 'processing'
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-amber-600 dark:text-amber-400';

  // --- UI Rendering ---
  const Wrapper = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {children}
    </div>
  );

  if (loading) {
    return (
      <Wrapper>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Upcoming Prints
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center py-6 sm:py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-500 mb-2 sm:mb-0 sm:mr-2" />
          <span className="text-gray-600 dark:text-gray-400">
            Loading upcoming prints...
          </span>
        </div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Upcoming Prints
          </h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          <p>Error loading upcoming prints: {error}</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
          <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Prints
        </h2>
      </div>

      {upcomingPrints.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No upcoming prints</p>
          <p className="text-sm">Your pending print jobs will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingPrints.map((print) => (
            <motion.div
              key={print.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-3">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-900 dark:text-gray-100 font-medium break-words">
                  {print.fileName}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${getStatusColor(print.status)} text-right`}
              >
                {getStatusText(print.status, print.pickupTime, print.urgency)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Wrapper>
  );
};

export default UpcomingPrintsCard;
