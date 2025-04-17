import React, { useState, useEffect, useCallback } from "react";
import PaymentForm from "../../components/payment/PaymentForm";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { useCart } from "../../context/CartContext";
import { apiService } from "../../services/api";
import paystackService from "../../services/paystackService";
import { useDispatch } from "react-redux";
import { ADD_ORDER } from "../../redux/orebiSlice";

const Payment = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
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
        dispatch(ADD_ORDER(response.order));
        // Dispatch order to Redux

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
      subtotal: item.price * item.quantity,
      color: item.color,
      color_variant_id: item.color_variant_id,
      size: item.size,
      size_variant_id: item.size_variant_id
    }));

    return {
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.zipCode ? ' ' + formData.zipCode : ''}`,
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
      <PaymentForm />
    </div>
  );
};

export default Payment;
