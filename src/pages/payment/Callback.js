import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import apiService from '../../services/api';

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        
        if (!reference) {
          throw new Error('Payment reference not found');
        }

        // Verify payment with backend
        const result = await apiService.verifyPayment(reference);
        
        if (result.success) {
          setStatus('success');
          setMessage('Payment successful!');
          setOrderId(result.order?.id);
        } else {
          setStatus('failed');
          setMessage(result.message || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during payment processing');
      }
    };

    verifyPayment();
  }, [location.search]);

  const handleContinue = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate('/');
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">
          {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="mb-6">{message}</p>
        <button
          onClick={handleContinue}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          {status === 'success' ? 'View Order' : 'Return to Home'}
        </button>
      </div>
    </div>
  );
};

export default PaymentCallback;
