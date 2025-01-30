import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
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
export default SettingsSection