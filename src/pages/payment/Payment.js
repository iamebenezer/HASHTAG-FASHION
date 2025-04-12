import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { useCart } from "../../context/CartContext";
import { apiService } from "../../services/api";
import paystackService from "../../services/paystackService";

const Payment = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "paystack" // Default to Paystack
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingFees, setShippingFees] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);

  // Fetch shipping fees on component mount
  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const fees = await apiService.shippingFees.getAll();
        console.log("Fetched shipping fees:", fees); // Log the fetched fees
        setShippingFees(fees.map(fee => ({
            ...fee,
            fee: parseFloat(fee.fee) // Ensure fee is a number
        })));
      } catch (err) {
        console.error("Failed to fetch shipping fees:", err);
        setError("Failed to load shipping options. Please refresh the page.");
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
    }
  }, [formData.state, shippingFees]);
  
  // Calculate totals without tax
  const subtotal = cart.totalPrice;
  const total = subtotal + shippingCost;

  // Update order status based on Paystack callback response
  const handlePaystackCallback = useCallback(async (callbackData) => {
    const { reference, status, message, transaction, trans } = callbackData;

    if (!reference) {
      setError("Invalid payment reference. Please try again.");
      return;
    }

    try {
      // Get order by reference first
      const verifyResponse = await paystackService.verifyPayment(reference);
      
      // Update the order status using the reference
      const response = await apiService.orders.updateStatus(reference, {
        status: status === 'success' || verifyResponse?.data?.status === 'success' ? 'paid' : 'failed',
        payment_reference: reference,
        transaction_id: transaction || trans // handle both inline and redirect callbacks
      });

      if (status === 'success' || verifyResponse?.data?.status === 'success') {
        setOrderPlaced(true);
        setOrderId(response.order.id);
        clearCart();
      } else {
        setError(message || verifyResponse?.data?.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Error handling Paystack callback:', err);
      setError('Failed to verify payment. Please contact support.');
    }
  }, [clearCart, setError, setOrderPlaced, setOrderId]);

  // Check for payment status in URL params (from Paystack callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const callbackData = {
      reference: params.get('reference'),
      status: params.get('status'),
      message: params.get('message'),
      transaction: params.get('transaction')
    };

    if (callbackData.status) {
      handlePaystackCallback(callbackData);
    }
  }, [location, clearCart, handlePaystackCallback]);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [cart.items.length, navigate, orderPlaced]);

  // Load Paystack script
  useEffect(() => {
    paystackService.loadPaystackScript()
      .catch(err => {
        console.error("Failed to load Paystack script:", err);
        setError("Payment gateway is not available. Please try another payment method.");
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create order first with pending status
      const reference = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
      const orderData = createOrderData(reference, 'pending');
      
      const orderResponse = await apiService.orders.create(orderData);
      const orderId = orderResponse.id || orderResponse.reference || reference;
      
      // Initialize Paystack payment after order creation
      const paymentData = {
        email: formData.email,
        amount: total , // Convert to kobo (smallest currency unit)
        reference: reference,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        metadata: {
          order_id: orderId,
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone
        }
      };
      
      await paystackService.initializePayment(paymentData);
    } catch (err) {
      console.error("Payment/order error:", err);
      setError(err.message || "Failed to process your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };
  
  // Removed handlePaystackPayment as its functionality is now integrated into handleSubmit
  
  
  
  const createOrderData = (reference, status) => {
    const formattedItems = cart.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    return {
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city || '',
        state: formData.state || '',
        zip_code: formData.zipCode || ''
      },
      items: formattedItems,
      payment_method: formData.paymentMethod,
      payment_reference: reference,
      status: status,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total_amount: total,
      payment_data: formData.paymentMethod === 'paystack' ? {
        reference: reference,
        amount: total,
        email: formData.email
      } : null
    };
  };

  if (orderPlaced) {
    return (
      <div className="max-w-container mx-auto px-4">
        <Breadcrumbs title="Payment Success" />
        <div className="pb-10">
          <h2 className="text-2xl font-semibold mb-4">Thank you for your order!</h2>
          <p>Your order has been placed successfully.</p>
          <p>Order ID: {orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Payment" />
      <div className="pb-10">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select State</option>
                    {shippingFees.map((fee) => (
                      <option key={fee.state} value={fee.state}>
                        {fee.state} (₦{fee.fee.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>₦{shippingCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₦{total.toFixed(2)}</span>
                </div>
                <div>
                  <label className="block mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value="paystack"
                    disabled
                    className="w-full border p-2 rounded bg-gray-100"
                  >
                    <option value="paystack">Paystack</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded hover:bg-opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
