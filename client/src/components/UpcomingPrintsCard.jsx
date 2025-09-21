import { useState, useEffect } from "react"
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

        // Fetch user orders
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        
        // Filter for upcoming/pending orders
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

        // Sort by urgency and pickup time
        upcoming.sort((a, b) => {
          const urgencyOrder = { 'Express': 0, 'Urgent': 1, 'Normal': 2 };
          const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;
          
          if (a.pickupTime && b.pickupTime) {
            return a.pickupTime - b.pickupTime;
          }
          return b.orderDate - a.orderDate;
        });

        setUpcomingPrints(upcoming.slice(0, 3)); // Show only 3 upcoming

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
    if (status === 'processing') {
      return 'Currently processing';
    }
    if (pickupTime) {
      const now = new Date();
      const diffHours = Math.floor((pickupTime - now) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `Ready for pickup in ${diffHours} hours`;
      } else {
        return `Scheduled for ${pickupTime.toLocaleDateString()}`;
      }
    }
    
    const urgencyText = urgency === 'Express' ? 'Express (2-4 hours)' : 
                       urgency === 'Urgent' ? 'Urgent (Same day)' : 
                       'Normal (24-48 hours)';
    return `Queued - ${urgencyText}`;
  };

  const getStatusColor = (status) => {
    return status === 'processing' ? 'text-blue-600 dark:text-blue-400' : 
           'text-amber-600 dark:text-amber-400';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Prints</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading upcoming prints...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Prints</h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          <p>Error loading upcoming prints: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
          <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Prints</h2>
      </div>
      
      {upcomingPrints.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
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
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{print.fileName}</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(print.status)}`}>
                {getStatusText(print.status, print.pickupTime, print.urgency)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

  export default UpcomingPrintsCard