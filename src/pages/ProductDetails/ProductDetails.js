import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Image from "../../components/designLayouts/Image";
import apiService from "../../services/api";
import { getCache, setCache } from "../../utils/cache";
import { useCart } from "../../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from "../../components/LoadingSpinner";
import PreorderPaymentButton from "../../components/PreorderPaymentButton";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Utility function to transform backend keys to frontend camelCase
  const transformProduct = (product) => ({
    ...product,
    colorVariants: (product.color_variants || product.colorVariants || []).map(variant => ({
      ...variant,
      sizeVariants: variant.size_variants || variant.sizeVariants || []
    }))
  });

  useEffect(() => {
    if (location.state?.item) {
      const productData = location.state.item;
      setProduct({
        ...productData,
        colorVariants: productData.colorVariants || productData.color_variants || [],
      });
      fetchProductDetails(productData._id || productData.id);
    } else {
      const productId = location.pathname.split("/").pop();
      fetchProductDetails(productId);
    }
  }, [location]);

  useEffect(() => {
    // Reset selected size when color changes
    setSelectedSize(null);
  }, [selectedColor]);

  useEffect(() => {
    if (location.state?.item) {
      const productData = location.state.item;
      setProduct({
        ...productData,
        colorVariants: productData.colorVariants || productData.color_variants || [],
      });
      fetchProductDetails(productData._id || productData.id);
    } else {
      const productId = location.pathname.split("/").pop();
      fetchProductDetails(productId);
    }
  }, [location]);

  const fetchProductDetails = async (id) => {
    try {
      setLoading(true);
      const cacheKey = `product_${id}`;
      const cached = getCache(cacheKey);
      if (cached) {
        const transformed = transformProduct(cached);
        setProduct(transformed);
        // Set default color variant if available
        const variants = transformed.colorVariants || [];
        if (variants.length > 0) {
          setSelectedColor(variants[0]);
        }
        setLoading(false);
        return;
      }
      const productData = await apiService.products.getById(id);
      const productObj = productData.data ? productData.data : productData;
      const transformed = transformProduct(productObj);
      setProduct(transformed);
      setCache(cacheKey, transformed, 600000); // 10 minutes
      // Set default color variant if available
      const variants = transformed.colorVariants || [];
      if (variants.length > 0) {
        setSelectedColor(variants[0]);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // If product has color variants but none selected, show error
    if (product.colorVariants && product.colorVariants.length > 0 && !selectedColor) {
      toast.error("Please select a color variant");
      return;
    }
    // If color has size variants but none selected, show error
    if (selectedColor && selectedColor.sizeVariants && selectedColor.sizeVariants.length > 0 && !selectedSize) {
      toast.error("Please select a size");
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
        img: product.image_url || `https://admin.hashtagfashionbrand.com/storage/${product.image}`,
        color: selectedColor?.color_name || "Default",
        color_variant_id: selectedColor?.id || null,
        size: selectedSize?.size || null,
        size_variant_id: selectedSize?.id || null,
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
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Always use admin.hashtagfashionbrand.com as base
    return `https://admin.hashtagfashionbrand.com/storage/${imagePath}`;
  };

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Breadcrumbs 
        title="Products" 
        prevLocation="Shop" 
        currentLocation={product.name || product.productName} 
      />
      
      <div className="w-full flex flex-col md:flex-row gap-10">
        {/* Product Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <Image 
            className="w-full max-w-xs h-auto object-contain" 
            imgSrc={getImageUrl(product.image) || product.img} 
            loading="lazy"
          />
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.name || product.productName}</h1>
          <p className="text-xl text-primeColor font-semibold mb-4">
            ₦{formatPrice(product.price)}
          </p>
          
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Color:</label>
              <div className="flex gap-2">
                {product.colorVariants.map((variant) => (
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

          {selectedColor && selectedColor.sizeVariants && selectedColor.sizeVariants.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Size:</label>
              <div className="flex gap-2">
                {selectedColor.sizeVariants.filter(sv => sv.is_active).map((sizeVar) => (
                  <button
                    key={sizeVar.id}
                    onClick={() => setSelectedSize(sizeVar)}
                    className={`px-4 py-2 rounded border-2 flex items-center justify-center cursor-pointer ${
                      selectedSize?.id === sizeVar.id ? 'border-primeColor bg-primeColor text-white' : 'border-gray-300 bg-white text-black'
                    }`}
                    title={sizeVar.size}
                  >
                    {sizeVar.size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="mt-2 text-sm text-gray-600">Selected: {selectedSize.size}</p>
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
            <p className="text-gray-600">{product.description || product.des}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Category:</span> {product.category?.name || "Uncategorized"}</li>
              {selectedColor && <li><span className="font-medium">Color:</span> {selectedColor.color_name}</li>}
              {selectedSize && <li><span className="font-medium">Size:</span> {selectedSize.size}</li>}
              {!selectedColor && product.color && <li><span className="font-medium">Color:</span> {product.color}</li>}
            </ul>
          </div>

          <div className="flex gap-4">
            {/* Regular Add to Cart Button - only show if not a preorder product */}
            {!product.is_preorder && (
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
              selectedSize={selectedSize}
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

export default ProductDetails;
