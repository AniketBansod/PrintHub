import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Settings, BarChart, LogOut, ToggleLeft, ToggleRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
  ]

  const handleServiceToggle = () => {
    setServiceStatus(!serviceStatus)
  }

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
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "users" && <UsersSection navigate={navigate} />}
        {activeTab === "settings" && (
          <SettingsSection
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
      </main>
    </div>
  )
}

const OverviewSection = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Users" value="1,234" />
      <StatCard title="Active Printers" value="15" />
      <StatCard title="Print Jobs Today" value="89" />
      <StatCard title="Revenue This Month" value="5,678 credits" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <QueuePredictionCard />
      <UrgentRequestsCard />
    </div>
  </div>
)

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
    <h3 className="text-gray-400 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-amber-400">{value}</p>
  </div>
)

const QueuePredictionCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Queue Prediction</h3>
    <p className="text-gray-300 mb-2">Predicted peak times:</p>
    <ul className="list-disc list-inside text-amber-400">
      <li>Today: 2:00 PM - 4:00 PM</li>
      <li>Tomorrow: 10:00 AM - 12:00 PM</li>
    </ul>
    <p className="text-gray-300 mt-4">Suggested actions:</p>
    <ul className="list-disc list-inside text-green-400">
      <li>Increase staff during peak hours</li>
      <li>Encourage off-peak printing</li>
    </ul>
  </div>
)

const UrgentRequestsCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Urgent Requests</h3>
    <ul className="space-y-2">
      <li className="flex items-center justify-between bg-red-800 p-3 rounded-md">
        <span>Faculty Handouts - Due in 30 minutes</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-500 text-gray-900 px-3 py-1 rounded-md hover:bg-amber-400"
        >
          Prioritize
        </motion.button>
      </li>
      <li className="flex items-center justify-between bg-red-800 p-3 rounded-md">
        <span>Exam Papers - Due in 1 hour</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-500 text-gray-900 px-3 py-1 rounded-md hover:bg-amber-400"
        >
          Prioritize
        </motion.button>
      </li>
    </ul>
  </div>
)

const ServiceStatusSection = ({ serviceStatus, reason, setReason, handleServiceToggle }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Service Status</h2>
    <div className="flex items-center mb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleServiceToggle}
        className={`flex items-center p-2 rounded-md ${
          serviceStatus ? "bg-green-500" : "bg-red-500"
        } text-gray-900`}
      >
        {serviceStatus ? <ToggleRight className="mr-2 h-5 w-5" /> : <ToggleLeft className="mr-2 h-5 w-5" />}
        {serviceStatus ? "Service ON" : "Service OFF"}
      </motion.button>
    </div>
    {!serviceStatus && (
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
          Select Reason
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        >
          <option value="">Select a reason</option>
          <option value="No Electricity">No Electricity</option>
          <option value="Lunch Break">Lunch Break</option>
          <option value="Personal Reason">Personal Reason</option>
        </select>
      </div>
    )}
  </div>
)

const UsersSection = ({ navigate }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">User Management</h2>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-800">
          <th className="p-2 border border-gray-700">Name</th>
          <th className="p-2 border border-gray-700">Student ID</th>
          <th className="p-2 border border-gray-700">Orders</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2 border border-gray-700">John Doe</td>
          <td className="p-2 border border-gray-700">12345678</td>
          <td className="p-2 border border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/orders/john-doe")}
              className="text-amber-400 hover:text-amber-300"
            >
              View Order
            </motion.button>
          </td>
        </tr>
        {/* Add more user rows as needed */}
      </tbody>
    </table>
  </div>
)

const SettingsSection = ({ priceSettings, handlePriceChange, savePricing }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
    <form className="space-y-4">
      <div>
        <label htmlFor="blackWhite" className="block text-sm font-medium text-gray-300 mb-2">
          Price Per Page (Black & White)
        </label>
        <input
          type="number"
          id="blackWhite"
          step="0.1"
          value={priceSettings.blackWhite}
          onChange={handlePriceChange}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
          Price Per Page (Color)
        </label>
        <input
          type="number"
          id="color"
          step="0.1"
          value={priceSettings.color}
          onChange={handlePriceChange}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={savePricing}
        className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
      >
        Save Settings
      </motion.button>
    </form>
  </div>
)

export default AdminDashboard

