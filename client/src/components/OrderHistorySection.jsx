import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"
const OrderHistorySection = () => {
    const [orders, setOrders] = useState([
      {
        date: "2025-01-30",
        items: ["Assignment.pdf", "Lecture_Notes.docx"],
        total: 3.0,
        status: "Completed",
      },
    ])
  
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Order Date: {order.date}</h3>
                <p>Items: {order.items.join(", ")}</p>
                <p className="text-amber-400 font-bold">Total: {order.total} credits</p>
                <p>Status: {order.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  export default OrderHistorySection
  