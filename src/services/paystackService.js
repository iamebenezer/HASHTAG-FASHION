import PaystackPop from '@paystack/inline-js';
import { apiService } from './api';

/**
 * Paystack API Service
 * This service handles all Paystack-related API calls
 */

// Paystack public key - using the same live key as regular checkout
const PAYSTACK_PUBLIC_KEY = "pk_live_bcaa7ed12333000a393421a5fad299172b29c4bb";

/**
 * Initialize Paystack payment
 * @param {Object} paymentData - Payment data including customer info and amount
 * @returns {Promise} - Promise that resolves with payment popup
 */
export const initializePayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate required fields
      if (!paymentData.email) {
        throw new Error('Email is required');
      }
      if (!paymentData.amount || isNaN(paymentData.amount)) {
        throw new Error('Valid amount is required');
      }
      
      console.log("Initializing Paystack payment with data:", paymentData);
      
      const paystack = new PaystackPop();
      const amount = Math.round(paymentData.amount * 100); // Convert to kobo
      
      if (amount < 100) {
        throw new Error('Amount must be at least 1 NGN');
      }

      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount, // Amount in kobo
        currency: 'NGN',
        ref: paymentData.reference,
        onSuccess: (response) => {
          console.log("Paystack callback response:", response);

          // Call the custom callback if provided
          if (paymentData.callback && typeof paymentData.callback === 'function') {
            paymentData.callback(response);
          }

          // Let the webhook handle order status update
          resolve(response);
        },
        onClose: () => {
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
        },
        callback_url: paymentData.callback_url,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        label: paymentData.customerName || paymentData.metadata?.customer_name || ""
      });
    } catch (error) {
      console.error("Error initializing Paystack payment:", error);
      reject(error);
    }
  });
};

/**
 * Load Paystack package
 * @returns {Promise} - Promise that resolves when package is loaded
 */
export const loadPaystackScript = () => {
  return new Promise((resolve) => {
    // The package is already loaded through import
    resolve(PaystackPop);
  });
};

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference
 * @returns {Promise} - Promise that resolves with payment verification result
 */
export const verifyPayment = async (reference) => {
  try {
    return await apiService.orders.getById(reference);
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
