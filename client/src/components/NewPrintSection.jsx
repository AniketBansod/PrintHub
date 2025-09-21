import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// ✅ 1. Import the real Redux hooks and actions
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../slices/printJobSlice";
import { usePricing } from "../context/PricingContext";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { NotificationProvider, useNotification } from '../context/NotificationContext';

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

const NewPrintSection = () => {
  // ✅ 2. Use the real Redux hooks to connect to your store
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.printJobs.cart);
  
  // ✅ 3. Use dynamic pricing from context
  const { calculatePrice, loading: pricingLoading, error: pricingError } = usePricing();
  const { showSuccess, showError } = useNotification();

  // ✅ 4. State management
  const [printOptions, setPrintOptions] = useState({
    pages: "",
    copies: "1",
    color: "Black & White",
    sides: "Single-sided",
    paperSize: "A4",
    urgency: "Normal",
    pickupTime: getLocalDateTime(new Date()),
  });

  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [ecoSuggestion, setEcoSuggestion] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 5. Calculate price whenever print options change
  useEffect(() => {
    if (pricingLoading) return; // Don't calculate while loading
    
    const pageCount = parsePagesInput(printOptions.pages).length;
    const copies = parseInt(printOptions.copies, 10) || 0;
    
    if (pageCount > 0 && copies > 0) {
      const priceCalculation = calculatePrice(
        pageCount,
        copies,
        printOptions.color,
        printOptions.sides,
        printOptions.paperSize
      );
      setEstimatedPrice(priceCalculation.total);
    } else {
      setEstimatedPrice(0);
    }
  }, [printOptions, calculatePrice, pricingLoading]);

  // --- Event Handlers ---
  const handlePrintOptionsChange = (e) => {
    const { name, value } = e.target;
    const updatedPrintOptions = { ...printOptions, [name]: value };
    setPrintOptions(updatedPrintOptions);

    if (name === "sides" && value === "Single-sided") {
      setEcoSuggestion("Consider double-sided printing to save paper!");
    } else if (name === "sides") {
      setEcoSuggestion("");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        setError("Please upload a valid file type (PDF, DOC, DOCX, JPG, PNG)");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate file
      if (!file) {
        setError("Please select a file to upload");
        return;
      }

      // Upload file to Cloudinary first
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();
      const cloudinaryUrl = uploadData.url;
      const originalFilename = uploadData.originalFilename || file.name;

      // Validate pages
      const pageCount = parsePagesInput(printOptions.pages).length;
      if (pageCount === 0) {
        setError("Please specify valid pages to print");
        return;
      }

      // Validate copies
      const copies = parseInt(printOptions.copies, 10);
      if (copies <= 0) {
        setError("Please specify valid number of copies");
        return;
      }

      // Calculate final price
      const priceCalculation = calculatePrice(
        pageCount,
        copies,
        printOptions.color,
        printOptions.sides,
        printOptions.paperSize
      );

      // Create print job object with Cloudinary URL
      const printJob = {
        id: Date.now().toString(),
        file: cloudinaryUrl, // Store Cloudinary URL
        originalFilename: originalFilename, // Store original filename
        pages: printOptions.pages,
        pageCount: pageCount,
        copies: copies,
        color: printOptions.color,
        sides: printOptions.sides,
        paperSize: printOptions.paperSize,
        urgency: printOptions.urgency,
        pickupTime: printOptions.pickupTime,
        price: priceCalculation.total,
        priceBreakdown: priceCalculation,
        timestamp: new Date().toISOString(),
      };

      // Add to cart using Redux
      dispatch(addToCart(printJob));

      // Reset form
      setPrintOptions({
        pages: "",
        copies: "1",
        color: "Black & White",
        sides: "Single-sided",
        paperSize: "A4",
        urgency: "Normal",
        pickupTime: getLocalDateTime(new Date()),
      });
      setFile(null);
      setEstimatedPrice(0);
      setEcoSuggestion("");

      // Show success notification instead of alert
      showSuccess("Print job added to cart successfully!");
    } catch (err) {
      setError("Failed to add print job to cart: " + err.message);
      showError("Failed to add print job to cart: " + err.message);
      console.error("Error adding print job:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if pricing is still loading
  if (pricingLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">New Print Job</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading pricing information...</span>
        </div>
      </div>
    );
  }

  // Show error state if pricing failed to load
  if (pricingError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">New Print Job</h2>
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          <p>Error loading pricing information: {pricingError}</p>
          <p className="text-sm mt-2">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">New Print Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enhanced File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Document
          </label>
          
          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                isDragOver
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragOver ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <Upload className={`h-12 w-12 mb-4 ${isDragOver ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Supports PDF, DOC, DOCX, JPG, PNG files
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md transition-colors duration-200">
                  Browse Files
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-500 dark:text-green-400" />
                      <span className="text-green-800 dark:text-green-200 font-medium">{file.name}</span>
                    </div>
                    <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={removeFile}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Print Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pages to Print
            </label>
            <input
              type="text"
              name="pages"
              value={printOptions.pages}
              onChange={handlePrintOptionsChange}
              placeholder="e.g., 1-5, 10, 15-20 or 'all'"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Copies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Copies
            </label>
            <input
              type="number"
              name="copies"
              value={printOptions.copies}
              onChange={handlePrintOptionsChange}
              min="1"
              max="100"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <select
              name="color"
              value={printOptions.color}
              onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
            >
              <option value="Black & White">Black & White</option>
              <option value="Color">Color</option>
            </select>
          </div>

          {/* Sides */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Print Sides
            </label>
            <select
              name="sides"
              value={printOptions.sides}
              onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
            >
              <option value="Single-sided">Single-sided</option>
              <option value="Double-sided">Double-sided</option>
            </select>
          </div>

          {/* Paper Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paper Size
            </label>
            <select
              name="paperSize"
              value={printOptions.paperSize}
              onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urgency
            </label>
            <select
              name="urgency"
              value={printOptions.urgency}
              onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
            >
              <option value="Normal">Normal (24-48 hours)</option>
              <option value="Urgent">Urgent (Same day)</option>
              <option value="Express">Express (2-4 hours)</option>
            </select>
          </div>
        </div>

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Pickup Time
          </label>
          <input
            type="datetime-local"
            name="pickupTime"
            value={printOptions.pickupTime}
            onChange={handlePrintOptionsChange}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
            required
          />
        </div>

        {/* Price Estimation */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Price Estimation</h3>
          <div className="text-blue-700 dark:text-blue-100">
            <div className="flex justify-between">
              <span>Estimated Total:</span>
              <span className="font-bold text-xl">₹{estimatedPrice.toFixed(2)}</span>
            </div>
            {printOptions.pages && (
              <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                {parsePagesInput(printOptions.pages).length} pages × {printOptions.copies} copies
              </div>
            )}
          </div>
        </div>

        {/* Eco Suggestion */}
        {ecoSuggestion && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded">
            {ecoSuggestion}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting || !file || estimatedPrice === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
            isSubmitting || !file || estimatedPrice === 0
              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {isSubmitting ? "Adding to Cart..." : "Add to Cart"}
        </motion.button>
      </form>
    </div>
  );
};

export default NewPrintSection;
