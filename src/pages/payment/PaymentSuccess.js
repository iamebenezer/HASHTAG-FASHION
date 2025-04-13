import React from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";

const PaymentSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Payment Success" />
      <div className="pb-10">
        <h2 className="text-2xl font-semibold mb-4">Thank you for your order!</h2>
        <p>Your payment was successful.</p>
        {orderId && <p>Order ID: {orderId}</p>}
      </div>
    </div>
  );
};

export default PaymentSuccess;
