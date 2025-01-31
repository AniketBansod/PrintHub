import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Settings, BarChart, LogOut, ToggleLeft, ToggleRight, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import OverviewSection from "../components/OverviewSection"
import UsersSection from "../components/UsersSection"
import OrderDetails from "../components/OrderDetails"
import SystemSettingsSection from "../components/SystemSettingsSection"
import ServiceStatusSection from "../components/ServiceStatusSection"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [serviceStatus, setServiceStatus] = useState(true)
  const [reason, setReason] = useState("")
  const [priceSettings, setPriceSettings] = useState({ blackWhite: 1.0, color: 2.0 })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pricing")
        const data = await response.json()
        if (response.ok) {
          setPriceSettings(data)
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Failed to fetch pricing settings:", error)
      }
    }

    fetchPricing()
  }, [])

  const handlePriceChange = (e) => {
    const { id, value } = e.target
    setPriceSettings((prev) => ({
      ...prev,
      [id]: parseFloat(value),
    }))
  }

  const savePricing = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(priceSettings),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error(data.message)
      }
    } catch (error) {
      console.error("Failed to update pricing settings:", error)
    }
  }

  const menuItems = [
    { id: "overview", icon: BarChart, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "settings", icon: Settings, label: "System Settings" },
    { id: "serviceStatus", icon: serviceStatus ? ToggleRight : ToggleLeft, label: "Service Status" },
    {id: "orderDetails", icon: FileText, label: "Order Details"}
  ]

  const handleServiceToggle = () => {
    setServiceStatus(!serviceStatus)
  }

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('token');
    // Redirect to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col h-screen">
        <div className="mb-8">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s"
            alt="Campus Printing Hub Logo"
            className="h-12 w-12 mx-auto mb-2"
          />
          <h2 className="text-xl font-bold text-center text-amber-400">Admin Dashboard</h2>
        </div>
        <nav>
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-2 rounded-md mb-2 ${
                activeTab === item.id ? "bg-amber-500 text-gray-900" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </motion.button>
          ))}
        </nav>
       {/* Logout Section */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </motion.button>
      </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "users" && <UsersSection />}
        {activeTab === "settings" && (
          <SystemSettingsSection
            priceSettings={priceSettings}
            handlePriceChange={handlePriceChange}
            savePricing={savePricing}
          />
        )}
        {activeTab === "serviceStatus" && (
          <ServiceStatusSection
            serviceStatus={serviceStatus}
            reason={reason}
            setReason={setReason}
            handleServiceToggle={handleServiceToggle}
          />
        )}
        {activeTab === "orderDetails" && <OrderDetails />}
      </main>
    </div>
  )
}

export default AdminDashboard

