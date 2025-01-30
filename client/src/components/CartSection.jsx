import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../slices/printJobSlice';

const CartSection = () => {
  
    const handlePayment = () => {
      // Implement payment logic here
      console.log("Payment processed")
      // After payment, clear the cart and move items to order history
      setCart([])
    }
  
    const dispatch = useDispatch();
    const cartRedux = useSelector((state) => state.printJob.cart);

    const handleRemoveFromCart = (id) => {
      dispatch(removeFromCart(id));
    };

    const handleClearCart = () => {
      dispatch(clearCart());
    };
  
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Cart</h2>
        {cartRedux.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div>
            <ul className="space-y-4">
              {cartRedux.map((item, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-2">{item.file}</h3>
                  <p>Copies: {item.copies}</p>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                  <p>Sides: {item.sides}</p>
                  <p>Pages: {item.pages}</p>
                  <p>Schedule: {item.schedule}</p>
                  <p className="text-amber-400 font-bold">Price: {item.estimatedPrice} Rupees</p>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="mt-2 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-400 transition duration-300 ease-in-out"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleClearCart}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-500 transition duration-300 ease-in-out"
            >
              Clear Cart
            </button>
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