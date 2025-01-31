import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PrintJobDetails = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrintJobs = async () => {
      try {
        console.log("Fetching details for orderId:", orderId);
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/details`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch print job details');
        }

        console.log("Received print jobs:", data);
        setPrintJobs(data);
      } catch (error) {
        console.error("Error:", error);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => navigate(-1)} 
          className="text-amber-500 hover:text-amber-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Print Job Details</h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-amber-500 hover:text-amber-600"
        >
          Back to Orders
        </button>
      </div>
      
      {printJobs.length === 0 ? (
        <div className="text-center text-gray-500">
          No print jobs found for this order.
        </div>
      ) : (
        <div className="space-y-4">
          {printJobs.map((job, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Print Job #{index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">File:</p>
                  <p className="text-amber-400">{job.file}</p>
                </div>
                <div>
                  <p className="text-gray-400">Copies:</p>
                  <p className="text-amber-400">{job.copies}</p>
                </div>
                <div>
                  <p className="text-gray-400">Size:</p>
                  <p className="text-amber-400">{job.size}</p>
                </div>
                <div>
                  <p className="text-gray-400">Color:</p>
                  <p className="text-amber-400">{job.color}</p>
                </div>
                <div>
                  <p className="text-gray-400">Sides:</p>
                  <p className="text-amber-400">{job.sides}</p>
                </div>
                <div>
                  <p className="text-gray-400">Pages:</p>
                  <p className="text-amber-400">{job.pages}</p>
                </div>
                <div>
                  <p className="text-gray-400">Schedule:</p>
                  <p className="text-amber-400">{job.schedule}</p>
                </div>
                <div>
                  <p className="text-gray-400">Price:</p>
                  <p className="text-amber-400">₹{job.estimatedPrice}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintJobDetails; 