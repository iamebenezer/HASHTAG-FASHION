import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Product from "../../components/home/Products/Product";
import LoadingSpinner from "../../components/LoadingSpinner";
import apiService from "../../services/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ComingSoon = () => {
  const [preorderProducts, setPreorderProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreorderProducts = async () => {
      try {
        setLoading(true);
        // Fetch preorder products directly from dedicated endpoint
        const response = await apiService.products.getPreorderProducts();

        // All products from this endpoint are preorder products
        const preorderItems = response;
        
        // Transform products to match the expected format
        const transformedProducts = preorderItems.map(product => ({
          ...product,
          _id: product.id,
          img: product.image_url || product.image || '/default-product-image.jpg',
          productName: product.name,
          price: typeof product.price === 'string' ? product.price : product.price?.toLocaleString(),
          des: product.description,
          color: product.color || 'N/A',
          badge: false,
          is_preorder: true,
          preorder_release_date: product.preorder_release_date,
          preorder_description: product.preorder_description
        }));
        
        setPreorderProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching preorder products:', err);
        setError(err.message || 'Failed to fetch preorder products');
        toast.error('Failed to load coming soon products');
      } finally {
        setLoading(false);
      }
    };

    fetchPreorderProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-container mx-auto px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Breadcrumbs title="Coming Soon Products" />
      
      {/* Header Section */}
      <div className="pb-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primeColor mb-4">Coming Soon</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get ready for our exciting new arrivals! Pre-order these exclusive items now and be the first to get them when they're released.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {preorderProducts.length === 0 && !loading && !error ? (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Pre-orders Available</h2>
              <p className="text-gray-600 mb-6">
                We don't have any pre-order products at the moment. Check back soon for exciting new arrivals!
              </p>
              <a
                href="/shop"
                className="bg-primeColor text-white px-6 py-3 rounded hover:bg-black transition-colors duration-300"
              >
                Browse Current Products
              </a>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Products Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {preorderProducts.map((product) => (
                <div key={product._id} className="relative">
                  <Product {...product} />
                  {/* Preorder Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Pre-order
                    </span>
                  </div>
                  {/* Release Date Badge */}
                  {product.preorder_release_date && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                        {new Date(product.preorder_release_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mt-16 bg-gray-50 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">How Pre-orders Work</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="font-semibold mb-2">1. Place Your Pre-order</h3>
                  <p className="text-gray-600 text-sm">
                    Select your preferred item and fill out the pre-order form with your details.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">⏰</div>
                  <h3 className="font-semibold mb-2">2. Wait for Release</h3>
                  <p className="text-gray-600 text-sm">
                    We'll keep you updated on the production progress and expected release date.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🚚</div>
                  <h3 className="font-semibold mb-2">3. Get Notified</h3>
                  <p className="text-gray-600 text-sm">
                    Once available, we'll contact you to complete your purchase and arrange delivery.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="mt-12 text-center bg-primeColor text-white rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
              <p className="mb-6">
                Be the first to know about new pre-order products and exclusive releases.
              </p>
              <div className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded font-semibold transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;
