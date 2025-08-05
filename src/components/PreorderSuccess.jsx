import React from 'react';
import { useNavigate } from 'react-router-dom';

const PreorderSuccess = ({ preorderData, orderData }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (typeof price === 'string') {
      if (price.includes('₦')) return price;
      price = price.replace(/,/g, '');
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return price;
    return `₦${numericPrice.toLocaleString('en-NG')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre-order Confirmed!</h2>
            <p className="text-gray-600">
              Thank you for your pre-order. Your payment has been received successfully.
            </p>
          </div>

          {/* Preorder Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3">Pre-order Details</h3>
            
            {preorderData && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pre-order ID:</span>
                  <span className="font-medium">#{preorderData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{preorderData.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{preorderData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">{formatPrice(preorderData.total_amount)}</span>
                </div>
                {preorderData.product?.preorder_release_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Release:</span>
                    <span className="font-medium">
                      {new Date(preorderData.product.preorder_release_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            
            {preorderData && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{preorderData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{preorderData.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{preorderData.customer_phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-yellow-800">What's Next?</h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>• You will receive an email confirmation shortly</p>
              <p>• We'll notify you when your item is ready to ship</p>
              <p>• Your item will be shipped to the address you provided</p>
              <p>• No additional payment required - you've paid in full!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              Go to Home
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Questions about your pre-order?</p>
            <p>Contact us at support@hashtagfashionbrand.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreorderSuccess;
