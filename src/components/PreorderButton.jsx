import React, { useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/api';

const PreorderButton = ({ product, selectedColor, selectedSize, quantity = 1, className = "" }) => {
  const [isPreordering, setIsPreordering] = useState(false);
  const [showPreorderForm, setShowPreorderForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
  });

  const handlePreorderClick = () => {
    // Check if product has color variants but none selected
    if (product.color_variants && product.color_variants.length > 0 && !selectedColor) {
      toast.error("Please select a color variant");
      return;
    }

    setShowPreorderForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsPreordering(true);

      const preorderData = {
        product_id: product.id,
        color_variant_id: selectedColor?.id || null,
        size_variant_id: selectedSize?.id || null,
        quantity: quantity,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        notes: formData.notes
      };

      const response = await apiService.preorders.create(preorderData);
      
      toast.success("Pre-order submitted successfully! We'll contact you when the product is available.");
      setShowPreorderForm(false);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error submitting preorder:', error);
      toast.error(error.response?.data?.message || "Failed to submit pre-order. Please try again.");
    } finally {
      setIsPreordering(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Don't show preorder button if product is not available for preorder
  const isPreorderProduct = product.is_preorder === true || product.is_preorder === 1 || product.is_preorder === "1";
  if (!isPreorderProduct) {
    return null;
  }

  return (
    <>
      <button
        onClick={handlePreorderClick}
        disabled={isPreordering}
        className={`bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded transition-colors duration-300 ${className}`}
      >
        {isPreordering ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Pre-order Now'
        )}
      </button>

      {/* Pre-order Form Modal */}
      {showPreorderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Pre-order: {product.name}</h3>
                <button
                  onClick={() => setShowPreorderForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Product Summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <img 
                    src={product.image_url || product.img} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-gray-600">₦{typeof product.price === 'string' ? product.price : product.price?.toLocaleString()}</p>
                    {selectedColor && <p className="text-sm text-gray-600">Color: {selectedColor.color_name}</p>}
                    {selectedSize && <p className="text-sm text-gray-600">Size: {selectedSize.size}</p>}
                    <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                    {product.preorder_release_date && (
                      <p className="text-sm text-blue-600">Expected: {new Date(product.preorder_release_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your delivery address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests or notes (optional)"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPreorderForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPreordering}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    {isPreordering ? 'Submitting...' : 'Submit Pre-order'}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500">
                <p>* Required fields</p>
                <p>We'll contact you when this item becomes available for purchase.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreorderButton;
