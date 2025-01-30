import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { addToCart } from "../slices/printJobSlice"

const NewPrintSection = ({ priceSettings }) => {
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.printJob.cart)
    console.log("Cart State:", cart);
    const [file, setFile] = useState(null);
    const [estimatedPrice, setEstimatedPrice] = useState(0)
    const [ecoSuggestion, setEcoSuggestion] = useState("")
    const [message, setMessage] = useState("")
    const [printOptions, setPrintOptions] = useState({
      color: "Black & White",
      pages: 0,
      copies: 0,
      sides: "Single-sided",
      paperSize: "A4",
    })
    const [schedule, setSchedule] = useState("")
    const [error, setError] = useState("")
    useEffect(() => {
        console.log("Updated Cart:", cart);
      }, [cart]);
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

      const handleFileChange = (e) => {
        setFile(e.target.files[0]);
      };
  
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('copies', printOptions.copies || 1);
        formData.append('size', printOptions.paperSize || 'A4');
        formData.append('color', printOptions.color || 'Black & White');
        formData.append('sides', printOptions.sides || 'Single-sided');
        formData.append('pages', printOptions.pages || '1');
        formData.append('schedule', schedule || 'Not specified');
        formData.append('estimatedPrice', estimatedPrice || 0);

        try {
            const response = await fetch('http://localhost:5000/api/print', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error creating print job');
            }

            const data = await response.json();
            
            // Add to cart using Redux
            dispatch(
                addToCart({
                    file: file.name,
                    ...printOptions,
                    schedule,
                    estimatedPrice,
                })
            );

            // Reset form
            setFile(null);
            setPrintOptions({
                color: "Black & White",
                pages: 0,
                copies: 0,
                sides: "Single-sided",
                paperSize: "A4",
            });
            setSchedule("");
            setEstimatedPrice(0);
            setError("");

            // Show success message
            setMessage("Print job added to cart successfully!");
            setTimeout(() => setMessage(""), 3000);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error adding print job');
        }
    };

    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">New Print Job</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
              Upload Document
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-amber-500 file:text-gray-900
                hover:file:bg-amber-400"
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
          <label htmlFor="paperSize" className="block text-sm font-medium text-gray-300 mb-2">
            Paper Size
          </label>
          <select
            id="paperSize"
            name="paperSize"
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
            <label htmlFor="schedule" className="block text-sm font-medium text-gray-300 mb-2">
              Schedule Print Time
            </label>
            <input
              type="datetime-local"
              id="schedule"
              name="schedule"
              onChange={(e) => setSchedule(e.target.value)}
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
          {message && (
            <div className="bg-blue-800 text-blue-100 p-3 rounded-md">
              <p>{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-800 text-red-100 p-3 rounded-md">
              <p>{error}</p>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
          >
            Add to Cart
          </motion.button>
        </form>
        <div>
          <h3 className="text-xl font-semibold mt-6">Cart Items</h3>
          <ul>
            {cart.map((job, index) => (
              <li key={index}>{job.file} - {job.estimatedPrice} Rupees</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  export default NewPrintSection
