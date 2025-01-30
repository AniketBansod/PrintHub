
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
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
  export default CloudStorageSection