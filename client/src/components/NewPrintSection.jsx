import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/printJobSlice";
import { usePricing } from "../context/PricingContext";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNotification } from '../context/NotificationContext';
import { API } from "../lib/api";

// Helper functions remain the same
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

const NewPrintSection = () => {
  const dispatch = useDispatch();
  const { calculatePrice, loading: pricingLoading, error: pricingError } = usePricing();
  const { showSuccess, showError } = useNotification();

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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pricingLoading) return;
    
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

  const handlePrintOptionsChange = (e) => {
    const { name, value } = e.target;
    setPrintOptions({ ...printOptions, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
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
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (allowedTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        showError("Please upload a valid file type (PDF, DOC, DOCX, JPG, PNG)");
      }
    }
  };

  const removeFile = () => setFile(null);

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
      if (!file) throw new Error("Please select a file to upload");

      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch(`${API}/api/upload`, { method: 'POST', body: formData });
      if (!uploadResponse.ok) throw new Error('Failed to upload file');
      const uploadData = await uploadResponse.json();

      const pageCount = parsePagesInput(printOptions.pages).length;
      if (pageCount === 0) throw new Error("Please specify valid pages to print");

      const copies = parseInt(printOptions.copies, 10);
      if (copies <= 0) throw new Error("Please specify a valid number of copies");
      
      const priceCalculation = calculatePrice(pageCount, copies, printOptions.color, printOptions.sides, printOptions.paperSize);

      const printJob = {
        id: Date.now().toString(),
        file: uploadData.url,
        originalFilename: uploadData.originalFilename || file.name,
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

      dispatch(addToCart(printJob));
      setPrintOptions({
        pages: "", copies: "1", color: "Black & White", sides: "Single-sided",
        paperSize: "A4", urgency: "Normal", pickupTime: getLocalDateTime(new Date()),
      });
      setFile(null);
      setEstimatedPrice(0);
      showSuccess("Print job added to cart successfully!");
    } catch (err) {
      showError(err.message || "Failed to add print job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pricingLoading) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
                <span className="text-gray-600 dark:text-gray-300">Loading pricing...</span>
            </div>
        </div>
    );
  }

  if (pricingError) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg text-center">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>Error loading pricing: {pricingError}</p>
                <p className="text-sm mt-2">Please refresh or contact support.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">New Print Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Document
          </label>
          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors duration-200 ${
                isDragOver
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            >
              <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
              <motion.div initial={{ scale: 1 }} animate={{ scale: isDragOver ? 1.05 : 1 }} className="flex flex-col items-center">
                <Upload className={`h-10 w-10 sm:h-12 sm:w-12 mb-4 ${isDragOver ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Supports PDF, DOC, DOCX, JPG, PNG
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md transition-colors duration-200">
                  Browse Files
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-medium break-all">{file.name}</span>
                    <p className="text-green-600 dark:text-green-300 text-sm mt-1">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={removeFile} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 self-end sm:self-center">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages to Print</label>
            <input type="text" name="pages" value={printOptions.pages} onChange={handlePrintOptionsChange} placeholder="e.g., 1-5, 10, 15-20 or 'all'"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Copies</label>
            <input type="number" name="copies" value={printOptions.copies} onChange={handlePrintOptionsChange} min="1" max="100"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <select name="color" value={printOptions.color} onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option>Black & White</option>
              <option>Color</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Print Sides</label>
            <select name="sides" value={printOptions.sides} onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option>Single-sided</option>
              <option>Double-sided</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paper Size</label>
            <select name="paperSize" value={printOptions.paperSize} onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option>A4</option> <option>A3</option> <option>Letter</option> <option>Legal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgency</label>
            <select name="urgency" value={printOptions.urgency} onChange={handlePrintOptionsChange}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              <option>Normal (24-48 hours)</option>
              <option>Urgent (Same day)</option>
              <option>Express (2-4 hours)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Pickup Time</label>
          <input type="datetime-local" name="pickupTime" value={printOptions.pickupTime} onChange={handlePrintOptionsChange}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" required />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Price Estimation</h3>
          <div className="text-blue-700 dark:text-blue-100">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
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

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
          disabled={isSubmitting || !file || estimatedPrice === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 text-base ${
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
