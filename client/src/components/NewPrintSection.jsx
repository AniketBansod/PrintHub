import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"
const NewPrintSection = ({ priceSettings }) => {
    const [estimatedPrice, setEstimatedPrice] = useState(0)
    const [ecoSuggestion, setEcoSuggestion] = useState("")
    const [cart, setCart] = useState([])
    const [printOptions, setPrintOptions] = useState({
      color: "Black & White",
      pages: 0,
      copies: 0,
      sides: "Single-sided",
    })
  
    const handlePrintOptionsChange = (e) => {
        const { name, value } = e.target;
        
        // Parse numeric values properly
        const updatedPrintOptions = {
          ...printOptions,
          [name]: value,
        };
      
        if (name === "pages" || name === "copies") {
          updatedPrintOptions[name] = parseInt(value, 10) || 0;
        }
      
        setPrintOptions(updatedPrintOptions);
      
        // Use updatedPrintOptions for calculation to avoid stale state
        const pages = updatedPrintOptions.pages;
        const copies = updatedPrintOptions.copies;
        const pricePerPage = updatedPrintOptions.color === "Color" ? priceSettings.color : priceSettings.blackWhite;
        const totalCost = pricePerPage * pages * copies;
      
        setEstimatedPrice(totalCost);
      
        if (name === "sides" && value === "Single-sided") {
          setEcoSuggestion("Consider double-sided printing to save paper!");
        } else {
          setEcoSuggestion("");
        }
      };
  
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
            <label htmlFor="pages" className="block text-sm font-medium text-gray-300 mb-2">
              Pages to Print
            </label>
            <input
              type="number"
              id="pages"
              name="pages"
              min="0"
              defaultValue="0"
              onChange={handlePrintOptionsChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="copies" className="block text-sm font-medium text-gray-300 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              id="copies"
              name="copies"
              min="0"
              defaultValue="0"
              onChange={handlePrintOptionsChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
            />
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
            <p>Estimated Price: {estimatedPrice} Rupees</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setCart([...cart, printOptions])}
            className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
          >
            Add to Cart
          </motion.button>
        </form>
      </div>
    )
  }

  export default NewPrintSection
