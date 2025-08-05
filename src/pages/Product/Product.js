import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/api";
import Image from "../../designLayouts/Image";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCart } from "../../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PreorderPaymentButton from "../../components/PreorderPaymentButton";

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchProduct = async () => {
      try {
        // Get the product ID from the URL parameter
        const id = params._id;
        // Fetch product details using the ID
        const product = await apiService.products.getById(id);
        
        if (product) {
          console.log("Fetched product:", product);
          console.log("Is preorder?", product.is_preorder);
          console.log("Preorder fields:", {
            is_preorder: product.is_preorder,
            preorder_release_date: product.preorder_release_date,
            preorder_description: product.preorder_description
          });

          // Set the product data
          setProduct(product);
          
          // Set default color variant if available
          if (product.color_variants && product.color_variants.length > 0) {
            setSelectedColor(product.color_variants[0]);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params._id]);

  const handleAddToCart = async () => {
    // If product has color variants but none selected, show error
    if (product.color_variants && product.color_variants.length > 0 && !selectedColor) {
      toast.error("Please select a color variant");
      return;
    }

    try {
      setIsAddingToCart(true);
      
      // Format price correctly
      let price = product.price;
      if (typeof price === 'string') {
        price = price.replace(/,/g, '');
      }
      
      const cartItem = {
        id: product.id,
        productName: product.name,
        price: price,
        img: product.image_url || `${process.env.REACT_APP_API_URL || 'https://app.hashtagfashionbrand.com'}/storage/${product.image}`,
        color: selectedColor?.color_name || "Default",
        color_variant_id: selectedColor?.id || null,
        quantity: quantity,
        description: product.description || ""
      };
      
      console.log("Adding to cart:", cartItem);
      
      await addToCart(cartItem);
      
      // Show success feedback
      toast.success("Added to cart successfully!");
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
      setIsAddingToCart(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  // Format price for display
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      // Remove any existing commas first
      price = price.replace(/,/g, '');
    }
    return parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (imagePath?.startsWith('http')) {
      return imagePath;
    }
    return `${process.env.REACT_APP_API_URL || 'https://app.hashtagfashionbrand.com'}/storage/${imagePath}`;
  };

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Breadcrumbs 
        title="Products" 
        prevLocation="Shop" 
        currentLocation={product.name} 
      />
      
      <div className="w-full flex flex-col md:flex-row gap-10">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <div className="border p-4">
            <Image 
              className="w-full h-auto" 
              imgSrc={getImageUrl(product.image)} 
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-primeColor font-semibold mb-4">
            ₦{formatPrice(product.price)}
          </p>
          
          {product.color_variants && product.color_variants.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Color:</label>
              <div className="flex gap-2">
                {product.color_variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedColor(variant)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      selectedColor?.id === variant.id ? 'border-primeColor' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: variant.color_code }}
                    title={variant.color_name}
                  >
                    {selectedColor?.id === variant.id && <span className="text-white">✓</span>}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="mt-2 text-sm text-gray-600">Selected: {selectedColor.color_name}</p>
              )}
            </div>
          )}

          <div className="flex items-center mb-4">
            <label className="text-sm font-medium mr-2">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-12 px-2 py-1 text-center border-x border-gray-300"
              />
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Category:</span> {product.category?.name || "Uncategorized"}</li>
              {selectedColor && <li><span className="font-medium">Color:</span> {selectedColor.color_name}</li>}
            </ul>
          </div>

          <div className="flex gap-4 flex-wrap">
            {/* Regular Add to Cart Button - only show if not a preorder product */}
            {!(product.is_preorder === true || product.is_preorder === 1 || product.is_preorder === "1") && (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex items-center justify-center gap-2 bg-primeColor text-white px-6 py-3 rounded hover:bg-black transition ${
                  isAddingToCart ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <FaShoppingCart />
                {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>
            )}

            {/* Preorder Payment Button - only show if it's a preorder product */}
            <PreorderPaymentButton
              product={product}
              selectedColor={selectedColor}
              selectedSize={null} // Add size selection logic if needed
              quantity={quantity}
              className="px-6 py-3"
            />

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 transition"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
