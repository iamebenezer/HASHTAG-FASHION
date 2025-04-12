/**
 * Paystack API Service
 * This service handles all Paystack-related API calls
 */

// Replace with your actual Paystack public key
const PAYSTACK_PUBLIC_KEY = "pk_test_ccf2f056f486538b0bc75cbb73950164d05ba781";

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment data including customer info and amount
 * @returns {Promise} - Promise that resolves with payment popup
 */
export const initializePayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    if (typeof window.PaystackPop === 'undefined') {
      reject(new Error("Paystack SDK not loaded"));
      return;
    }

    try {
      console.log("Initializing Paystack payment with data:", paymentData);
      
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: Math.round(paymentData.amount * 100), // Amount in kobo
        currency: 'NGN',
        ref: paymentData.reference,
        callback_url: window.location.origin + '/payment',
        callback: function(response) {
          console.log("Paystack callback response:", response);
          resolve(response);
        },
        onClose: function() {
          console.log("Payment window closed");
          reject(new Error("Payment window closed"));
        },
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: paymentData.customerName || paymentData.metadata?.customer_name || ""
            },
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: paymentData.customerPhone || paymentData.metadata?.customer_phone || ""
            },
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: paymentData.metadata?.order_id || ""
            }
          ]
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error("Error initializing Paystack payment:", error);
      reject(error);
    }
  });
};

/**
 * Load Paystack script
 * @returns {Promise} - Promise that resolves when script is loaded
 */
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Paystack script loaded successfully");
      resolve(window.PaystackPop);
    };
    
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      reject(new Error('Failed to load Paystack script'));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference
 * @returns {Promise} - Promise that resolves with payment verification result
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`/paystack/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Payment verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

const paystackService = {
  initializePayment,
  loadPaystackScript,
  verifyPayment
};

export default paystackService;
