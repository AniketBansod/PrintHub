import React, { useState } from "react"
import { motion } from "framer-motion"
import { Users, Settings, BarChart, LogOut, ToggleRight, FileText, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import OverviewSection from "../components/OverviewSection"
import UsersSection from "../components/UsersSection"
import AdminOrderManagement from "../components/AdminOrderManagement"
import PricingSettingsSection from "../components/PricingSettingsSection"
import ServiceStatusManagement from "../components/ServiceStatusManagement"
import ProfileSection from "../components/ProfileSection"
import ThemeToggle from "../components/ThemeToggle"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const navigate = useNavigate()

  const menuItems = [
    { id: "overview", icon: BarChart, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "orderDetails", icon: FileText, label: "Order Details"},
    { id: "settings", icon: Settings, label: "Pricing Settings" },
    { id: "serviceStatus", icon: ToggleRight, label: "Service Status" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    // The only change is here: min-h-screen -> h-screen and add overflow-hidden
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
        <div className="mb-8">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s"
            alt="Campus Printing Hub Logo"
            className="h-12 w-12 mx-auto mb-2"
          />
          <h2 className="text-xl font-bold text-center text-amber-500">Admin Dashboard</h2>
        </div>
        <nav className="flex-1">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors duration-200 ${
                activeTab === item.id
                  ? "bg-amber-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </motion.button>
          ))}
        </nav>
       
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between p-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            <ThemeToggle />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </motion.button>
      </div>
      </aside>

      {/* Main Content (this part will now scroll independently) */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "users" && <UsersSection />}
        {activeTab === "settings" && <PricingSettingsSection />}
        {activeTab === "serviceStatus" && <ServiceStatusManagement />}
        {activeTab === "orderDetails" && <AdminOrderManagement />}
        {activeTab === "profile" && <ProfileSection />}
      </main>
    </div>
  )
}

export default AdminDashboard