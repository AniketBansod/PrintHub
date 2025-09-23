import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History, BarChart3, Loader2, Menu, X } from "lucide-react";
import { usePricing } from "../context/PricingContext.jsx";
import { API } from "../lib/api";
import SettingsSection from "../components/SettingsSection.jsx";
import OrderHistorySection from "../components/OrderHistorySection.jsx";
import CartSection from "../components/CartSection.jsx";
import QuickStatsCard from "../components/QuickStatsCard.jsx";
import UpcomingPrintsCard from "../components/UpcomingPrintsCard.jsx";
import RecentActivityCard from "../components/RecentActivityCard.jsx";
import PrintQuotaCard from "../components/PrintQuotaCard.jsx";
import NewPrintSection from "../components/NewPrintSection.jsx";

import ServiceStatusBanner from '../components/ServiceStatusBanner';
import ThemeToggle from '../components/ThemeToggle';
import ProfileSection from "../components/ProfileSection.jsx";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
  const [user, setUser] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", icon: Printer, label: "Dashboard" },
    { id: "newPrint", icon: FileText, label: "New Print" },
    { id: "cart", icon: ShoppingCart, label: "Cart" },
    { id: "history", icon: History, label: "Order History" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200 overflow-hidden">
      
      {/* --- Responsive Sidebar --- */}
      <aside 
        className={`absolute md:relative z-20 h-full w-64 bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
                 <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s" alt="Logo" className="h-10 w-10 mr-2"/>
                 <h2 className="text-xl font-bold text-center text-amber-500">Student Dashboard</h2>
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

        <div className="space-y-2">
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
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-500 dark:text-gray-300 mb-4">
            <Menu size={28} />
        </button>
        <ServiceStatusBanner />
        
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickStatsCard />
            <UpcomingPrintsCard />
            <RecentActivityCard />
            <PrintQuotaCard />
          </div>
        )}
        
        {activeTab === "newPrint" && <NewPrintSection />}
        {activeTab === "cart" && <CartSection />}
        {activeTab === "history" && <OrderHistorySection />}
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "settings" && <SettingsSection />}
      </main>
      
    </div>
  );
};

export default StudentDashboard;

