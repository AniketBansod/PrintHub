import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History, BarChart3, Loader2 } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"

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

        console.log('Fetching orders for stats...');
        
        // Fetch user orders
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Orders response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Orders API error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const orders = await response.json();
        console.log('Fetched orders:', orders);
        
        // Calculate stats from orders
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let totalPrints = 0;
        let pagesThisMonth = 0;
        let totalSpent = 0;
        const printerUsage = {};
        
        orders.forEach(order => {
          console.log('Processing order:', order.orderId, 'Status:', order.status);
          
          // Count all orders except cancelled ones
          if (order.status !== 'cancelled') {
            totalPrints += order.items.length;
            totalSpent += order.totalAmount;
            
            // Check if order is from current month
            const orderDate = new Date(order.orderDate);
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
              order.items.forEach(item => {
                console.log('Item pageCount:', item.pageCount, 'copies:', item.copies);
                pagesThisMonth += (item.pageCount || 0) * (item.copies || 0);
              });
            }
            
            // Track printer usage
            order.items.forEach(item => {
              const printer = item.printer || 'Library';
              printerUsage[printer] = (printerUsage[printer] || 0) + 1;
            });
          }
        });

        // Find most used printer
        const favoritePrinter = Object.keys(printerUsage).length > 0 
          ? Object.keys(printerUsage).reduce((a, b) => 
              printerUsage[a] > printerUsage[b] ? a : b, 'Library')
          : 'Library';

        // Calculate saved trees (rough estimate: 1 tree = ~8333 pages)
        const savedTrees = (pagesThisMonth / 8333).toFixed(1);

        console.log('Calculated stats:', {
          totalPrints,
          pagesThisMonth,
          favoritePrinter,
          savedTrees: parseFloat(savedTrees),
          totalSpent: parseFloat(totalSpent.toFixed(2))
        });

        setStats({
          totalPrints,
          pagesThisMonth,
          favoritePrinter,
          savedTrees: parseFloat(savedTrees),
          totalSpent: parseFloat(totalSpent.toFixed(2))
        });

      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          <p>Error loading stats: {error}</p>
          <p className="text-sm mt-2">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Prints</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalPrints}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Pages This Month</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pagesThisMonth}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Favorite Printer</p>
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.favoritePrinter}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Saved Trees</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.savedTrees}</p>
        </div>
      </div>
    </div>
  )
}

export default QuickStatsCard