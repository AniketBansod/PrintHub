import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"
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

  export default CartSection