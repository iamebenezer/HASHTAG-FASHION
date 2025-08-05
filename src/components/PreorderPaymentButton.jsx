import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import paystackService from '../services/paystackService';

const PreorderPaymentButton = ({ product, selectedColor, selectedSize, quantity = 1, className = "" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
  });
  const navigate = useNavigate();

  const handlePreorderClick = () => {
    // Check if product has color variants but none selected
    if (product.color_variants && product.color_variants.length > 0 && !selectedColor) {
      toast.error("Please select a color variant");
      return;
    }

    setShowPaymentForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_address) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate total amount
      let price = product.price;
      if (typeof price === 'string') {
        price = price.replace(/₦/g, '').replace(/,/g, '');
      }
      const numericPrice = parseFloat(price);
      const totalAmount = numericPrice * quantity;

      // Create preorder first
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

      const preorderResponse = await apiService.preorders.create(preorderData);
      const preorderId = preorderResponse.preorder.id;

      // Create order for payment processing
      const reference = 'PREORDER-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
      const orderData = {
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        shippingAddress: formData.customer_address,
        items: [{
          product_id: product.id,
          quantity: quantity,
          price: numericPrice,
          subtotal: totalAmount,
          color: selectedColor?.color_name || "Default",
          color_variant_id: selectedColor?.id || null,
          size: selectedSize?.size || null,
          size_variant_id: selectedSize?.id || null
        }],
        payment_method: 'paystack',
        payment_reference: reference,
        status: 'pending',
        subtotal: totalAmount,
        shipping_cost: 0, // No shipping for preorders
        total_amount: totalAmount,
        notes: `Preorder payment for: ${product.name}. Preorder ID: ${preorderId}`,
        is_preorder: true, // Flag to identify this as a preorder payment
        preorder_id: preorderId
      };

      const orderResponse = await apiService.orders.create(orderData);

      // Link the preorder to the order
      try {
        await apiService.preorders.linkOrder(preorderId, { order_id: orderResponse.id });
      } catch (linkError) {
        console.warn('Failed to link preorder to order:', linkError);
        // Continue with payment even if linking fails
      }

      // Initialize Paystack payment
      const paymentData = {
        email: formData.customer_email,
        amount: totalAmount,
        reference: reference,
        customerName: formData.customer_name,
        customerPhone: formData.customer_phone,
        metadata: {
          order_id: orderResponse.id,
          preorder_id: preorderId,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          is_preorder: true
        }
      };

      // Use existing paystack service
      await paystackService.initializePayment(paymentData);

    } catch (error) {
      console.error('Error processing preorder payment:', error);
      toast.error(error.response?.data?.message || "Failed to process preorder payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show preorder button if product is not available for preorder
  const isPreorderProduct = product.is_preorder === true || product.is_preorder === 1 || product.is_preorder === "1";
  if (!isPreorderProduct) {
    return null;
  }

  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      if (price.includes('₦')) return price;
      price = price.replace(/,/g, '');
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return price;
    return `₦${numericPrice.toLocaleString('en-NG')}`;
  };

  const totalPrice = (() => {
    let price = product.price;
    if (typeof price === 'string') {
      price = price.replace(/₦/g, '').replace(/,/g, '');
    }
    const numericPrice = parseFloat(price);
    return numericPrice * quantity;
  })();

  return (
    <>
      <button
        onClick={handlePreorderClick}
        disabled={isProcessing}
        className={`bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded transition-colors duration-300 ${className}`}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pre-order & Pay ${formatPrice(totalPrice)}`
        )}
      </button>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Your Pre-order</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
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
                    <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                    {selectedColor && <p className="text-sm text-gray-600">Color: {selectedColor.color_name}</p>}
                    {selectedSize && <p className="text-sm text-gray-600">Size: {selectedSize.size}</p>}
                    <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                    <p className="text-sm font-semibold text-yellow-600">Total: {formatPrice(totalPrice)}</p>
                    {product.preorder_release_date && (
                      <p className="text-xs text-blue-600">
                        Expected Release: {new Date(product.preorder_release_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address *
                    </label>
                    <textarea
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500">
                <p>* Required fields</p>
                <p>You'll be charged now at the preorder price. Item will be shipped when available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreorderPaymentButton;
