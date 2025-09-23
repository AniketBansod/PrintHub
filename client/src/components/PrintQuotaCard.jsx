import { useState, useEffect } from "react";
import { API } from "../lib/api";
import { TrendingUp, Calendar, Loader2, AlertCircle } from "lucide-react";

const PrintQuotaCard = () => {
  const [quota, setQuota] = useState({
    monthlyUsage: 0,
    monthlyLimit: 500,
    daysRemaining: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please login to view quota');
        }

        const response = await fetch(`${API}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let monthlyUsage = 0;
        
        orders.forEach(order => {
          const orderDate = new Date(order.orderDate);
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            order.items.forEach(item => {
              monthlyUsage += item.pageCount * item.copies;
            });
          }
        });

        const now = new Date();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysRemaining = lastDayOfMonth.getDate() - now.getDate();

        setQuota({
          monthlyUsage,
          monthlyLimit: 500, // This could be fetched from user profile
          daysRemaining
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, []);

  const usagePercentage = (quota.monthlyUsage / quota.monthlyLimit) * 100;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mr-3">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Print Quota</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading quota...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mr-3">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Print Quota</h2>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          <AlertCircle className="mx-auto h-8 w-8 mb-2"/>
          <p className="font-semibold">Error loading quota</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mr-3">
          <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Print Quota</h2>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="mb-3">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Monthly Usage</span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {quota.monthlyUsage} / {quota.monthlyLimit} pages
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                usagePercentage > 80 ? 'bg-red-500' : 
                usagePercentage > 60 ? 'bg-yellow-500' : 
                'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">0 pages</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{quota.monthlyLimit} pages</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          Your quota resets in {quota.daysRemaining} days
        </div>
        
        {usagePercentage > 80 && (
          <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>You're approaching your monthly limit.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintQuotaCard;
