import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const PrintJobDetails = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrintJobs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/details`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch print job details');
        }
        setPrintJobs(data);
      } catch (error) {
        setError(error.message || 'Failed to fetch print job details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchPrintJobs();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-red-700 dark:text-red-300 p-6 text-center bg-red-100 dark:bg-red-900/30 rounded-lg max-w-md border border-red-300 dark:border-red-700">
          <AlertCircle className="mx-auto h-12 w-12 mb-4 text-red-500"/>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100">Print Job Details</h2>
          <button 
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Orders
          </button>
        </div>
        
        {printJobs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="text-lg">No print jobs found for this order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {printJobs.map((job, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-amber-400">Print Job #{index + 1}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">File:</p>
                    <p className="font-medium break-all">{job.file}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Copies:</p>
                    <p className="font-medium">{job.copies}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Size:</p>
                    <p className="font-medium">{job.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Color:</p>
                    <p className="font-medium">{job.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Sides:</p>
                    <p className="font-medium">{job.sides}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Pages:</p>
                    <p className="font-medium">{job.pages}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Schedule:</p>
                    <p className="font-medium">{job.schedule}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Price:</p>
                    <p className="font-medium text-amber-500 dark:text-amber-400">₹{job.estimatedPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintJobDetails; 
