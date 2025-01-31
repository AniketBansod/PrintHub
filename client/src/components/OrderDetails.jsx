import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
      {order && (
        <div>
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>User ID:</strong> {order.userId.name}</p>
          <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
          <h3 className="text-xl font-semibold mt-4">Items</h3>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                <p><strong>File:</strong> {item.file}</p>
                <p><strong>Copies:</strong> {item.copies}</p>
                <p><strong>Size:</strong> {item.size}</p>
                <p><strong>Color:</strong> {item.color}</p>
                <p><strong>Sides:</strong> {item.sides}</p>
                <p><strong>Pages:</strong> {item.pages}</p>
                <p><strong>Estimated Price:</strong> ₹{item.estimatedPrice.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;