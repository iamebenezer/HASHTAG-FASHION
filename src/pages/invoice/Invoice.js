import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const Invoice = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await apiService.orders.getById(orderId);
        setOrder(data);
      } catch (err) {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading invoice...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8 mt-8 print:p-0 print:shadow-none">
      <h1 className="text-3xl font-bold mb-2 text-green-700">Payment Successful</h1>
      <p className="mb-4 text-gray-700">Thank you for your purchase! Here is your invoice.</p>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
        <div className="text-gray-800">
          <div><b>Order ID:</b> {order.id}</div>
          <div><b>Date:</b> {new Date(order.created_at).toLocaleString()}</div>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Payment Method:</b> {order.payment_method}</div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Customer Info</h2>
        <div className="text-gray-800">
          <div><b>Name:</b> {order.customerName}</div>
          <div><b>Email:</b> {order.customerEmail}</div>
          <div><b>Phone:</b> {order.customerPhone}</div>
          <div><b>Shipping Address:</b> {order.shippingAddress}</div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <table className="w-full border text-left text-sm mb-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td className="p-2 border">{item.product?.name || item.product_id}</td>
                <td className="p-2 border">{item.quantity}</td>
                <td className="p-2 border">₦{parseFloat(item.price).toLocaleString('en-NG')}</td>
                <td className="p-2 border">₦{parseFloat(item.subtotal).toLocaleString('en-NG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between font-bold text-lg mt-4">
        <span>Total:</span>
        <span>₦{parseFloat(order.total_amount).toLocaleString('en-NG')}</span>
      </div>
      <div className="mt-8 flex gap-4">
        <button
          onClick={handlePrint}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 print:hidden"
        >
          Print Invoice
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 print:hidden"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Invoice;
