import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [user, setUser] = useState({ name: "", email: "" })

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
        {activeTab === "newPrint" && <NewPrintSection />}
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

const QuickStatsCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-400">Total Prints</p>
        <p className="text-2xl font-bold text-amber-400">127</p>
      </div>
      <div>
        <p className="text-gray-400">Pages This Month</p>
        <p className="text-2xl font-bold text-amber-400">42</p>
      </div>
      <div>
        <p className="text-gray-400">Favorite Printer</p>
        <p className="text-lg font-semibold text-amber-400">Library</p>
      </div>
      <div>
        <p className="text-gray-400">Saved Trees</p>
        <p className="text-2xl font-bold text-green-400">0.5</p>
      </div>
    </div>
  </div>
)

const RecentActivityCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
    <ul className="space-y-2">
      <li className="flex justify-between items-center">
        <span>Printed Assignment.pdf</span>
        <span className="text-gray-400">2 hours ago</span>
      </li>
      <li className="flex justify-between items-center">
        <span>Added 100 print credits</span>
        <span className="text-gray-400">Yesterday</span>
      </li>
      <li className="flex justify-between items-center">
        <span>Uploaded Lecture_Notes.docx to cloud</span>
        <span className="text-gray-400">3 days ago</span>
      </li>
    </ul>
  </div>
)

const UpcomingPrintsCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Upcoming Prints</h2>
    <ul className="space-y-2">
      <li className="flex justify-between items-center">
        <span>Research_Paper.pdf</span>
        <span className="text-amber-400">Scheduled for tomorrow, 2 PM</span>
      </li>
      <li className="flex justify-between items-center">
        <span>Group_Project.ppt</span>
        <span className="text-amber-400">Queued for printing</span>
      </li>
    </ul>
  </div>
)

const PrintQuotaCard = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Print Quota</h2>
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span>Monthly Usage</span>
        <span>42 / 500 pages</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "8.4%" }}></div>
      </div>
    </div>
    <p className="text-sm text-gray-400">Your quota resets in 18 days</p>
  </div>
)

const NewPrintSection = () => {
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [ecoSuggestion, setEcoSuggestion] = useState("")
  const [cart, setCart] = useState([])

  const handlePrintOptionsChange = (e) => {
    // Implement real-time price estimation logic here
    setEstimatedPrice(1.5) // Placeholder value

    // Implement eco-friendly suggestions
    if (e.target.name === "sides" && e.target.value === "single") {
      setEcoSuggestion("Consider double-sided printing to save paper!")
    } else {
      setEcoSuggestion("")
    }
  }

  const addToCart = () => {
    const newPrintJob = {
      document: "Sample Document",
      printer: "Library Printer",
      copies: 1,
      size: "A4",
      color: "Black & White",
      sides: "Single-sided",
      pages: "1-5",
      schedule: "Tomorrow, 2 PM",
      price: estimatedPrice,
    }
    setCart([...cart, newPrintJob])
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">New Print Job</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
            Upload Document
          </label>
          <input
            type="file"
            id="file"
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-amber-500 file:text-gray-900
              hover:file:bg-amber-400"
          />
        </div>
        <div>
          <label htmlFor="printer" className="block text-sm font-medium text-gray-300 mb-2">
            Select Printer
          </label>
          <select
            id="printer"
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          >
            <option>Library Printer</option>
            <option>Student Center Printer</option>
            <option>Dorm Printer</option>
          </select>
        </div>
        <div>
          <label htmlFor="copies" className="block text-sm font-medium text-gray-300 mb-2">
            Number of Copies
          </label>
          <input
            type="number"
            id="copies"
            name="copies"
            min="1"
            defaultValue="1"
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-2">
            Paper Size
          </label>
          <select
            id="size"
            name="size"
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          >
            <option>A4</option>
            <option>A3</option>
            <option>Letter</option>
            <option>Legal</option>
          </select>
        </div>
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
            Color Option
          </label>
          <select
            id="color"
            name="color"
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          >
            <option>Black & White</option>
            <option>Color</option>
          </select>
        </div>
        <div>
          <label htmlFor="sides" className="block text-sm font-medium text-gray-300 mb-2">
            Sides
          </label>
          <select
            id="sides"
            name="sides"
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          >
            <option>Single-sided</option>
            <option>Double-sided</option>
          </select>
        </div>
        <div>
          <label htmlFor="pages" className="block text-sm font-medium text-gray-300 mb-2">
            Pages to Print
          </label>
          <input
            type="text"
            id="pages"
            name="pages"
            placeholder="e.g., 1-5, 8, 11-13"
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="schedule" className="block text-sm font-medium text-gray-300 mb-2">
            Schedule Print Time
          </label>
          <input
            type="datetime-local"
            id="schedule"
            name="schedule"
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
          />
        </div>
        {ecoSuggestion && (
          <div className="bg-green-800 text-green-100 p-3 rounded-md">
            <p>{ecoSuggestion}</p>
          </div>
        )}
        <div className="bg-amber-800 text-amber-100 p-3 rounded-md">
          <p>Estimated Price: {estimatedPrice} credits</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={addToCart}
          className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
        >
          Add to Cart
        </motion.button>
      </form>
    </div>
  )
}

const CartSection = () => {
  const [cart, setCart] = useState([
    {
      document: "Sample Document",
      printer: "Library Printer",
      copies: 1,
      size: "A4",
      color: "Black & White",
      sides: "Single-sided",
      pages: "1-5",
      schedule: "Tomorrow, 2 PM",
      price: 1.5,
    },
  ])

  const handlePayment = () => {
    // Implement payment logic here
    console.log("Payment processed")
    // After payment, clear the cart and move items to order history
    setCart([])
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {cart.map((item, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">{item.document}</h3>
                <p>Printer: {item.printer}</p>
                <p>Copies: {item.copies}</p>
                <p>Size: {item.size}</p>
                <p>Color: {item.color}</p>
                <p>Sides: {item.sides}</p>
                <p>Pages: {item.pages}</p>
                <p>Schedule: {item.schedule}</p>
                <p className="text-amber-400 font-bold">Price: {item.price} credits</p>
              </li>
            ))}
          </ul>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            className="mt-4 w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
          >
            Proceed to Payment
          </motion.button>
        </div>
      )}
    </div>
  )
}

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

const CloudStorageSection = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Cloud Storage</h2>
    <ul className="space-y-2">
      <li className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
        <span>Resume.pdf</span>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-amber-400 hover:text-amber-300 mr-2"
          >
            Print
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </motion.button>
        </div>
      </li>
      <li className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
        <span>ID_Card.jpg</span>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-amber-400 hover:text-amber-300 mr-2"
          >
            Print
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </motion.button>
        </div>
      </li>
      {/* Add more cloud storage items as needed */}
    </ul>
  </div>
)

const SettingsSection = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Settings</h2>
    <form className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Notifications
        </label>
        <select
          id="email"
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        >
          <option>All notifications</option>
          <option>Important only</option>
          <option>None</option>
        </select>
      </div>
      <div>
        <label htmlFor="default-printer" className="block text-sm font-medium text-gray-300 mb-2">
          Default Printer
        </label>
        <select
          id="default-printer"
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        >
          <option>Library Printer</option>
          <option>Student Center Printer</option>
          <option>Dorm Printer</option>
        </select>
      </div>
      <div>
        <label htmlFor="default-size" className="block text-sm font-medium text-gray-300 mb-2">
          Default Paper Size
        </label>
        <select
          id="default-size"
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        >
          <option>A4</option>
          <option>A3</option>
          <option>Letter</option>
          <option>Legal</option>
        </select>
      </div>
      <div>
        <label htmlFor="default-color" className="block text-sm font-medium text-gray-300 mb-2">
          Default Color Option
        </label>
        <select
          id="default-color"
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        >
          <option>Black & White</option>
          <option>Color</option>
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
      >
        Save Settings
      </motion.button>
    </form>
  </div>
)

export default StudentDashboard

