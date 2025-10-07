import React, { useState, useCallback } from 'react';

// --- Filter Configurations ---
// Define a set of visually distinct filters using CSS filter syntax
const filterPresets = [
  { name: 'Original', style: 'none' },
  { name: 'Grayscale', style: 'grayscale(100%)' },
  { name: 'Sepia', style: 'sepia(100%)' },
  { name: 'High Contrast', style: 'contrast(180%) brightness(110%)' },
  { name: 'Vintage', style: 'sepia(70%) saturate(150%) contrast(120%)' },
  { name: 'Blue Tint', style: 'hue-rotate(200deg) contrast(150%)' },
  { name: 'Soft Blur', style: 'blur(2px) contrast(120%)' },
  { name: 'Saturated', style: 'saturate(250%)' },
];

// Main App Component
const App = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(filterPresets[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle image upload
  const handleImageUpload = useCallback((event) => {
    setError(null);
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setCurrentFilter(filterPresets[0]); // Reset to original filter on new image
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError("Failed to read the file.");
        setIsLoading(false);
        setOriginalImage(null);
      };

      reader.readAsDataURL(file);
    } else if (file) {
      setError("Please select a valid image file (PNG, JPG, etc.).");
    }
  }, []);

  // Function to handle image download
  const handleDownload = useCallback(() => {
    if (!originalImage || !currentFilter) {
      setError("Please upload an image and select a filter before downloading.");
      return;
    }

    // 1. Create a temporary canvas and context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set crossOrigin to anonymous to prevent tainting the canvas, 
    // though usually not needed for Data URLs, it's good practice.
    img.crossOrigin = "anonymous"; 

    img.onload = () => {
      // 2. Set canvas dimensions to match the original image
      canvas.width = img.width;
      canvas.height = img.height;

      // 3. Apply the CSS filter string directly to the canvas context
      // This is supported by most modern browsers for image manipulation.
      ctx.filter = currentFilter.style;

      // 4. Draw the image onto the canvas with the filter applied
      ctx.drawImage(img, 0, 0);

      // 5. Convert the canvas content (the filtered image) to a data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // 6. Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = dataURL;
      // Generate a user-friendly file name
      const cleanName = currentFilter.name.replace(/\s/g, '');
      link.download = `RajendraJatVlogs_${cleanName}_Filtered.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary canvas element
      canvas.remove();
    };

    img.src = originalImage;
  }, [originalImage, currentFilter]);

  // JSX for the main application
  return (
    // Responsive padding: p-4 for mobile, sm:p-8 for larger screens
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 font-inter">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          /* Sleek, subtle shadow for dark theme */
          .image-shadow { box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          /* Custom hover for previews */
          .preview-hover:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
          }
          .download-button {
            transition: all 0.2s ease-in-out;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          }
          .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
            background-color: #374151; /* Gray-700 */
          }
        `}
      </style>

      {/* Header */}
      <header className="mb-8 text-center">
        {/* Title scales down slightly on mobile (text-3xl) for better fit */}
        <h1 className="text-4xl font-extrabold text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] text-center">
          Rajendra Jat Vlogs Filter Application
        </h1>
        <p className="text-gray-400 mt-2">
          Upload an image and instantly preview popular filters.
        </p>
      </header>

      {/* Upload and Error Section */}
      {/* Container is responsive (max-w-4xl and mx-auto) */}
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl image-shadow mb-8 border border-gray-700">
        <label
          htmlFor="image-upload"
          // Upload button is always full-width (block)
          className="cursor-pointer block text-center p-4 border-2 border-dashed border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          {originalImage ? 'Click here to change image' : 'Click to Upload Image'}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="text-center mt-4 text-gray-400">
            Processing image...
          </div>
        )}
        
        {error && (
          <div className="text-center mt-4 p-2 bg-red-900/50 text-red-300 rounded-lg border border-red-700">
            Error: {error}
          </div>
        )}
      </div>

      {originalImage && (
        <>
          {/* Main Display Area */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 text-center sm:text-left mb-2 sm:mb-0">
                Current Filter: <span className="text-gray-400">{currentFilter.name}</span>
              </h2>
              
              {/* Download Button */}
              <button
                onClick={handleDownload}
                // Styled with a slight gradient for emphasis on the dark theme
                className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-gray-100 font-bold rounded-lg download-button hover:bg-gray-700 transition duration-200 flex items-center justify-center space-x-2"
                title="Download the currently selected filtered image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 12.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v9a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Download Filtered Image</span>
              </button>
            </div>

            {/* Image uses fluid width and constrained height for mobile viewing */}
            <div className="bg-gray-900 rounded-xl overflow-hidden image-shadow border-4 border-gray-700">
              <img
                src={originalImage}
                alt="Main filtered image"
                // w-full ensures image takes up container width, max-h-[70vh] limits vertical space
                className="w-full h-auto object-contain max-h-[70vh] transition duration-500 ease-in-out"
                style={{ filter: currentFilter.style }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x450/1f2937/d1d5db?text=Image+Load+Failed"; setError("Image could not be displayed."); }}
              />
            </div>
          </div>

          {/* Filter Preview Gallery */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-6 text-center">
            Filter Previews
          </h2>
          {/* Responsive Grid: 2 columns on mobile, 4 on small screens, 8 on large screens */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 max-w-6xl mx-auto">
            {filterPresets.map((filter) => (
              <div
                key={filter.name}
                className={`cursor-pointer bg-gray-800 p-2 rounded-xl transition duration-300 border-2 ${
                  // Highlighted border is a light silver/gray
                  filter.name === currentFilter.name
                    ? 'border-gray-400 scale-105 shadow-lg'
                    : 'border-transparent opacity-80 hover:opacity-100 preview-hover'
                }`}
                onClick={() => setCurrentFilter(filter)}
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={originalImage}
                    alt={`${filter.name} preview`}
                    className="w-full h-full object-cover"
                    style={{ filter: filter.style }}
                    // Note: Previews use a placeholder on error just to keep the grid layout clean
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/374151/9ca3af?text=Error"; }}
                  />
                </div>
                {/* Text size adjusted slightly for mobile readability */}
                <p className="text-center text-xs sm:text-sm mt-2 font-medium text-gray-300">
                  {filter.name}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Initial State Placeholder */}
      {!originalImage && !isLoading && (
        <div className="max-w-4xl mx-auto text-center p-12 bg-gray-800 rounded-xl border-2 border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-300 text-lg">
            Start by uploading an image above to begin filtering!
          </p>
        </div>
      )}
    </div>
  );
};

export default App;