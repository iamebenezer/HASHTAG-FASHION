import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import paystackService from '../services/paystackService';
import PreorderSuccess from './PreorderSuccess';
import { ADD_PREORDER, ADD_ORDER } from '../redux/orebiSlice';

const PreorderPaymentButton = ({ product, selectedColor, selectedSize, quantity = 1, className = "" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preorderData, setPreorderData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    city: '',
    state: '',
    notes: ''
  });
  const [shippingFees, setShippingFees] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch shipping fees on component mount
  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const fees = await apiService.shippingFees.getAll();
        setShippingFees(fees.map(fee => ({
          ...fee,
          fee: parseFloat(fee.fee)
        })));
      } catch (err) {
        console.error("Failed to fetch shipping fees:", err);
        toast.error("Failed to load shipping options. Please refresh the page.");
      }
    };
    fetchShippingFees();
  }, []);

  // Update shipping cost when state changes
  useEffect(() => {
    if (formData.state) {
      const selectedFee = shippingFees.find(fee => fee.state === formData.state);
      if (selectedFee) {
        setShippingCost(selectedFee.fee);
      }
    } else {
      setShippingCost(0);
    }
  }, [formData.state, shippingFees]);

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

  // Handle payment success callback
  const handlePaymentSuccess = useCallback(async (callbackData) => {
    const { reference, status } = callbackData;

    try {
      if (status === 'success') {
        // Update order status via API (this will trigger preorder status update)
        try {
          await apiService.orders.updateStatus(reference, {
            status: 'paid',
            transaction_id: callbackData.trans || callbackData.transaction,
            payment_reference: reference
          });

          console.log('Order status updated successfully');
        } catch (updateError) {
          console.error('Error updating order status:', updateError);
        }

        // Wait a moment for the backend to process the update
        setTimeout(async () => {
          try {
            // Fetch updated preorder data
            if (preorderData && preorderData.id) {
              const updatedPreorder = await apiService.preorders.getById(preorderData.id);
              setPreorderData(updatedPreorder);
            }

            setShowPaymentForm(false);
            setShowSuccess(true);
            toast.success("Pre-order payment successful! Your order has been confirmed.");
          } catch (error) {
            console.error('Error fetching updated preorder:', error);
            setShowPaymentForm(false);
            setShowSuccess(true);
            toast.success("Pre-order payment successful!");
          }
        }, 2000);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  }, [preorderData]);

  const validateForm = () => {
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_address || !formData.state) {
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
      const subtotal = numericPrice * quantity;
      const totalAmount = subtotal + shippingCost;

      // Create preorder first
      const preorderData = {
        product_id: product.id,
        color_variant_id: selectedColor?.id || null,
        size_variant_id: selectedSize?.id || null,
        quantity: quantity,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: `${formData.customer_address}, ${formData.city}, ${formData.state}`,
        notes: formData.notes
      };

      const preorderResponse = await apiService.preorders.create(preorderData);
      const preorderId = preorderResponse.preorder.id;

      // Store preorder data for success display
      setPreorderData(preorderResponse.preorder);

      // Dispatch preorder to Redux store
      dispatch(ADD_PREORDER(preorderResponse.preorder));

      // Create order for payment processing
      const reference = 'PREORDER-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
      const orderData = {
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
        customerPhone: formData.customer_phone,
        shippingAddress: `${formData.customer_address}, ${formData.city}, ${formData.state}`,
        items: [{
          product_id: product.id,
          quantity: quantity,
          price: numericPrice,
          subtotal: subtotal,
          color: selectedColor?.color_name || "Default",
          color_variant_id: selectedColor?.id || null,
          size: selectedSize?.size || null,
          size_variant_id: selectedSize?.id || null
        }],
        payment_method: 'paystack',
        payment_reference: reference,
        status: 'pending',
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        notes: `Preorder payment for: ${product.name}. Preorder ID: ${preorderId}`,
        is_preorder: true, // Flag to identify this as a preorder payment
        preorder_id: preorderId
      };

      const orderResponse = await apiService.orders.create(orderData);

      // Store order data for success display
      setOrderData(orderResponse);

      // Dispatch order to Redux store
      dispatch(ADD_ORDER(orderResponse));

      // Link the preorder to the order
      try {
        await apiService.preorders.linkOrder(preorderId, { order_id: orderResponse.id });
      } catch (linkError) {
        console.warn('Failed to link preorder to order:', linkError);
        // Continue with payment even if linking fails
      }

      // Initialize Paystack payment with callback
      const paymentData = {
        email: formData.customer_email,
        amount: totalAmount,
        reference: reference,
        customerName: formData.customer_name,
        customerPhone: formData.customer_phone,
        callback: handlePaymentSuccess,
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
    const subtotal = numericPrice * quantity;
    return subtotal + shippingCost;
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
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatPrice((() => {
                          let price = product.price;
                          if (typeof price === 'string') {
                            price = price.replace(/₦/g, '').replace(/,/g, '');
                          }
                          return parseFloat(price) * quantity;
                        })())}</span>
                      </div>
                      {shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Shipping:</span>
                          <span>{formatPrice(shippingCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold text-yellow-600 border-t border-gray-200 pt-1 mt-1">
                        <span>Total:</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
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
                      Street Address *
                    </label>
                    <textarea
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter your street address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      >
                        <option value="">Select State</option>
                        {shippingFees.map(fee => (
                          <option key={fee.state} value={fee.state}>
                            {fee.state} ({formatPrice(fee.fee)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {shippingCost > 0 && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex justify-between items-center text-sm">
                        <span>Shipping Cost:</span>
                        <span className="font-semibold text-blue-600">{formatPrice(shippingCost)}</span>
                      </div>
                    </div>
                  )}

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

      {/* Success Modal */}
      {showSuccess && (
        <PreorderSuccess 
          preorderData={preorderData}
          orderData={orderData}
        />
      )}
    </>
  );
};

export default PreorderPaymentButton;
