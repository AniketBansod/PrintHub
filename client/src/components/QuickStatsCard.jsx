import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, Loader2, AlertCircle } from "lucide-react"
import { API } from "../lib/api"

const QuickStatsCard = () => {
  const [stats, setStats] = useState({
    totalPrints: 0,
    pagesThisMonth: 0,
    favoritePrinter: 'Library',
    savedTrees: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view stats');
        }

        const response = await fetch(`${API}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const orders = await response.json();
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let totalPrints = 0;
        let pagesThisMonth = 0;
        let totalSpent = 0;
        const printerUsage = {};
        
        orders.forEach(order => {
          if (order.status !== 'cancelled') {
            totalPrints += order.items.length;
            totalSpent += order.totalAmount;
            
            const orderDate = new Date(order.orderDate);
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
              order.items.forEach(item => {
                pagesThisMonth += (item.pageCount || 0) * (item.copies || 0);
              });
            }
            
            order.items.forEach(item => {
              const printer = item.printer || 'Library';
              printerUsage[printer] = (printerUsage[printer] || 0) + 1;
            });
          }
        });

        const favoritePrinter = Object.keys(printerUsage).length > 0 
          ? Object.keys(printerUsage).reduce((a, b) => 
              printerUsage[a] > printerUsage[b] ? a : b, 'Library')
          : 'Library';

        const savedTrees = (pagesThisMonth / 8333).toFixed(1);

        setStats({
          totalPrints,
          pagesThisMonth,
          favoritePrinter,
          savedTrees: parseFloat(savedTrees),
          totalSpent: parseFloat(totalSpent.toFixed(2))
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4">
            <AlertCircle className="mx-auto h-8 w-8 mb-2"/>
            <p className="font-semibold">Error loading stats</p>
            <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Prints</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalPrints}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Pages This Month</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pagesThisMonth}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg col-span-2">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Spent</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">₹{stats.totalSpent.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default QuickStatsCard;
