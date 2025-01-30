import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"

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
  export default QuickStatsCard