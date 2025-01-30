import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"
import SettingsSection from "../components/SettingsSection.jsx"
import CloudStorageSection from "../components/CloudStorageSection.jsx"
import OrderHistorySection from "../components/OrderHistorySection.jsx"
import CartSection from "../components/CartSection.jsx"
import QuickStatsCard from "../components/QuickStatsCard.jsx"
import UpcomingPrintsCard from "../components/UpcomingPrintsCard.jsx"
import RecentActivityCard from "../components/RecentActivityCard.jsx"
import PrintQuotaCard from "../components/PrintQuotaCard.jsx"
import NewPrintSection from "../components/NewPrintSection.jsx"
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState({ name: "", email: "" })
  const { priceSettings } = usePricing()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setUser(data)
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    fetchProfile()
  }, [])

  const menuItems = [
    { id: "dashboard", icon: User, label: "Dashboard" },
    { id: "newPrint", icon: Printer, label: "New Print" },
    { id: "cart", icon: ShoppingCart, label: "Cart" },
    { id: "orderHistory", icon: History, label: "Order History" },
    { id: "cloudStorage", icon: Cloud, label: "Cloud Storage" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4">
        <div className="mb-8">
          <img
            src="/placeholder.svg?height=50&width=50"
            alt="Campus Printing Hub Logo"
            className="h-12 w-12 mx-auto mb-2"
          />
          <h2 className="text-xl font-bold text-center text-amber-400">Campus Printing Hub</h2>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center p-2 rounded-md mt-8 text-gray-300 hover:bg-gray-700"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>
       
        {activeTab === "dashboard" && <DashboardOverview user={user} />}
        {activeTab === "newPrint" && <NewPrintSection priceSettings={priceSettings} />}
        {activeTab === "cart" && <CartSection />}
        {activeTab === "orderHistory" && <OrderHistorySection />}
        {activeTab === "cloudStorage" && <CloudStorageSection />}
        {activeTab === "settings" && <SettingsSection />}
      </main>
    </div>
  )
}

const DashboardOverview = ({ user }) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <AccountInfoCard user={user} />
      <QuickStatsCard />
      <RecentActivityCard />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UpcomingPrintsCard />
      <PrintQuotaCard />
    </div>
  </div>
)

const AccountInfoCard = ({ user }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
    <div className="space-y-2">
      <p>
        <span className="text-gray-400">Name:</span> {user.name}
      </p>
      <p>
        <span className="text-gray-400">Email:</span> {user.email}
      </p>
    </div>
  </div>
)

export default StudentDashboard

