import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// ✅ 1. Import the real Redux hooks and actions
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../slices/printJobSlice";

// --- Helper Functions ---

function parsePagesInput(input) {
  const trimmedInput = input ? input.trim().toLowerCase() : "";
  if (trimmedInput === "all" || trimmedInput === "") return [];
  if (
    !isNaN(Number(trimmedInput)) &&
    !trimmedInput.includes(",") &&
    !trimmedInput.includes("-")
  ) {
    const pageQuantity = parseInt(trimmedInput, 10);
    return pageQuantity > 0
      ? Array.from({ length: pageQuantity }, (_, i) => i + 1)
      : [];
  }
  const pages = new Set();
  trimmedInput.split(",").forEach((part) => {
    const trimmedPart = part.trim();
    if (trimmedPart.includes("-")) {
      const [start, end] = trimmedPart.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) pages.add(i);
      }
    } else {
      const pageNum = Number(trimmedPart);
      if (!isNaN(pageNum)) pages.add(pageNum);
    }
  });
  return Array.from(pages);
}

const getLocalDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// --- Component ---

const NewPrintSection = ({ priceSettings = { color: 5, blackWhite: 2 } }) => {
  // ✅ 2. Use the real Redux hooks to connect to your store
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.printJob.cart);

  // --- Local Component State ---
  const [file, setFile] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [ecoSuggestion, setEcoSuggestion] = useState("");
  const [message, setMessage] = useState("");
  const [printOptions, setPrintOptions] = useState({
    color: "Black & White",
    pages: "",
    copies: "",
    sides: "Single-sided",
    paperSize: "A4",
  });
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Date and Time Constraints ---
  const now = new Date();
  const minDateTime = getLocalDateTime(now);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateTime = getLocalDateTime(maxDate);

  useEffect(() => {
    setSchedule(minDateTime);
  }, []);

  // --- Event Handlers ---
  const handlePrintOptionsChange = (e) => {
    const { name, value } = e.target;
    const updatedPrintOptions = { ...printOptions, [name]: value };
    setPrintOptions(updatedPrintOptions);

    const pageCount = parsePagesInput(updatedPrintOptions.pages).length;
    const copies = parseInt(updatedPrintOptions.copies, 10) || 0;
    const pricePerPage =
      updatedPrintOptions.color === "Color"
        ? priceSettings.color
        : priceSettings.blackWhite;
    const totalCost = pricePerPage * pageCount * copies;
    setEstimatedPrice(totalCost);

    if (name === "sides" && value === "Single-sided") {
      setEcoSuggestion("Consider double-sided printing to save paper!");
    } else if (name === "sides") {
      setEcoSuggestion("");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (estimatedPrice <= 0) {
      setError("Please specify the number of pages and copies.");
      return;
    }

    setIsSubmitting(true);

    // Prepare and send data to the server first
    const formData = new FormData();
    formData.append("file", file);
    formData.append("copies", printOptions.copies || 1);
    formData.append("size", printOptions.paperSize || "A4");
    formData.append("color", printOptions.color || "Black & White");
    formData.append("sides", printOptions.sides || "Single-sided");
    formData.append("pages", printOptions.pages || "1");
    formData.append("schedule", schedule || "Not specified");
    formData.append("estimatedPrice", estimatedPrice || 0);

    try {
      const response = await fetch("http://localhost:5000/api/print", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      const result = await response.json();
      
      // Create cart item with Cloudinary URL
      const newCartItem = {
        id: Date.now(),
        file: file.name,
        fileUrl: result.file, // Store the Cloudinary URL
        ...printOptions,
        schedule,
        estimatedPrice,
      };

      // Add to cart only after successful upload
      dispatch(addToCart(newCartItem));

      // Reset the form for the next entry
      setFile(null);
      if (document.getElementById("file"))
        document.getElementById("file").value = "";
      setPrintOptions({
        color: "Black & White",
        pages: "",
        copies: "",
        sides: "Single-sided",
        paperSize: "A4",
      });
      setSchedule(getLocalDateTime(new Date()));
      setEstimatedPrice(0);
      setMessage("Print job added to cart!");
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">New Print Job</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Upload Document
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-gray-900 hover:file:bg-amber-400"
          />
        </div>

        <div>
          <label
            htmlFor="copies"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Number of Copies
          </label>
          <input
            type="number"
            id="copies"
            name="copies"
            min="0"
            placeholder="0"
            value={printOptions.copies}
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="paperSize"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Paper Size
          </label>
          <select
            id="paperSize"
            name="paperSize"
            value={printOptions.paperSize}
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          >
            <option>A4</option>
            <option>A3</option>
            <option>Letter</option>
            <option>Legal</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Color Option
          </label>
          <select
            id="color"
            name="color"
            value={printOptions.color}
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          >
            <option>Black & White</option>
            <option>Color</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="sides"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Sides
          </label>
          <select
            id="sides"
            name="sides"
            value={printOptions.sides}
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          >
            <option>Single-sided</option>
            <option>Double-sided</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="pages"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Pages to Print
          </label>
          <input
            type="text"
            id="pages"
            name="pages"
            placeholder="e.g. 10, 1-5, 2,4,7-10"
            value={printOptions.pages}
            onChange={handlePrintOptionsChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          />
        </div>
        <div>
          <label
            htmlFor="schedule"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Schedule
          </label>
          <input
            type="datetime-local"
            id="schedule"
            name="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            min={minDateTime}
            max={maxDateTime}
            className="mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 text-gray-100 px-3 py-1.5 text-sm shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-40 transition-all duration-200"
          />
        </div>

        {ecoSuggestion && (
          <div className="bg-green-800 text-green-100 p-3 rounded-md">
            <p>{ecoSuggestion}</p>
          </div>
        )}
        <div className="bg-amber-800 text-amber-100 p-3 rounded-md">
          <p>Estimated Price: {estimatedPrice.toFixed(2)} Rupees</p>
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
          disabled={isSubmitting}
          className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold disabled:bg-gray-500"
        >
          {isSubmitting ? "Adding..." : "Add to Cart"}
        </motion.button>
      </form>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Cart Items</h3>
        <ul>
          {cart.map((job) => (
            <li key={job.id}>
              {job.file} - {job.estimatedPrice.toFixed(2)} Rupees
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewPrintSection;
