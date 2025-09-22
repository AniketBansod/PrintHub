import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Settings, BarChart, LogOut, ToggleRight, FileText, User, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OverviewSection from "../components/OverviewSection";
import UsersSection from "../components/UsersSection";
import AdminOrderManagement from "../components/AdminOrderManagement";
import PricingSettingsSection from "../components/PricingSettingsSection";
import ServiceStatusManagement from "../components/ServiceStatusManagement";
import ProfileSection from "../components/ProfileSection";
import ThemeToggle from "../components/ThemeToggle";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const navigate = useNavigate();

  const menuItems = [
    { id: "overview", icon: BarChart, label: "Overview" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "orderDetails", icon: FileText, label: "Order Details"},
    { id: "settings", icon: Settings, label: "Pricing Settings" },
    { id: "serviceStatus", icon: ToggleRight, label: "Service Status" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200 overflow-hidden">
      
      {/* --- Responsive Sidebar --- */}
      <aside 
        className={`absolute md:relative z-20 h-full w-64 bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s" alt="Logo" className="h-10 w-10 mr-2"/>
                <h2 className="text-xl font-bold text-center text-amber-500">Admin Dashboard</h2>
            </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1">
          {menuItems.map((item) => (
            <motion.button key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
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
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </motion.button>
        </div>
      </aside>

      {/* --- Overlay for mobile when sidebar is open --- */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 md:hidden"></div>}

      {/* --- Main Content --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Hamburger Menu Button - visible only on mobile (md:hidden) */}
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-500 dark:text-gray-300 mb-4">
            <Menu size={28} />
        </button>
        
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "users" && <UsersSection />}
        {activeTab === "settings" && <PricingSettingsSection />}
        {activeTab === "serviceStatus" && <ServiceStatusManagement />}
        {activeTab === "orderDetails" && <AdminOrderManagement />}
        {activeTab === "profile" && <ProfileSection />}
      </main>
    </div>
  );
};

export default AdminDashboard;

