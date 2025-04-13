import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccessModal = ({ orderId, onClose }) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    onClose();
    navigate(`/payment/success?orderId=${orderId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Payment Successful</h2>
        <p className="mb-4">Your order has been successfully placed.</p>
        <p className="mb-6">Order ID: {orderId}</p>
        <button
          onClick={handleClose}
          className="w-full bg-black text-white py-2 rounded hover:bg-opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
