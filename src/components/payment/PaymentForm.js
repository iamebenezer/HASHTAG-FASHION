import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useDispatch } from 'react-redux';
import { apiService } from '../../services/api';
import { ADD_ORDER } from "../../redux/orebiSlice";
import { createOrder } from '../../redux/orderSlice';
import { formatPrice } from '../../utils/format';

const PaymentForm = () => {
  const { cart, clearCart } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const publicKey = "pk_live_bcaa7ed12333000a393421a5fad299172b29c4bb";

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingFees, setShippingFees] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const fees = await apiService.shippingFees.getAll();
        setShippingFees(fees.map(fee => ({
          ...fee,
          fee: parseFloat(fee.fee)
        })));
      } catch (err) {
        setError('Failed to load shipping options. Please refresh the page.');
      }
    };
    fetchShippingFees();
  }, []);

  useEffect(() => {
    if (formData.state) {
      const selectedFee = shippingFees.find(fee => fee.state === formData.state);
      if (selectedFee) setShippingCost(selectedFee.fee);
    }
  }, [formData.state, shippingFees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.zipCode ? ' ' + formData.zipCode : ''}`,
        items: cart.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: parseFloat(item.price.toString().replace(/,/g, '')) * item.quantity,
          color: item.color || "Default",
          color_variant_id: item.color_variant_id,
          size: item.size,
          size_variant_id: item.size_variant_id
        })),
        payment_method: 'paystack',
        payment_reference: response.reference,
        status: 'paid',
        subtotal: cart.totalPrice,
        shipping_cost: shippingCost,
        total_amount: cart.totalPrice + shippingCost,
        payment_data: {
          reference: response.reference,
          amount: cart.totalPrice + shippingCost,
          email: formData.email
        },
        created_at: new Date().toISOString()
      };

      const order = await apiService.orders.create(orderData);
      clearCart();
      navigate(`/invoice/${order.id}`, { state: { order } });
    } catch (err) {
      setError('Failed to process order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const componentProps = {
    email: formData.email,
    amount: (cart.totalPrice + shippingCost) * 100, // Convert to kobo
    metadata: {
      name: formData.fullName,
      phone: formData.phone,
    },
    publicKey,
    text: 'Pay Now',
    onSuccess: handlePaymentSuccess,
    onClose: () => {
      setError('Payment cancelled. Please try again.');
      alert("Wait! Don't leave :(");
    }
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <div className="pb-10">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>
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
                  {shippingFees.map(fee => (
                    <option key={fee.state} value={fee.state}>
                      {fee.state} ({formatPrice(fee.fee)})
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
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(cart.totalPrice + shippingCost)}</span>
              </div>
              <div className="mt-6">
                {!loading && formData.fullName && formData.email && formData.phone && formData.address && formData.state ? (
                  <PaystackButton
                    {...componentProps}
                    className="w-full bg-black text-white py-3 rounded hover:bg-opacity-90"
                  />
                ) : loading ? (
                  <button
                    disabled
                    className="w-full bg-black text-white py-3 rounded opacity-50"
                  >
                    Processing...
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-3 rounded"
                  >
                    Please fill in all required fields
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;