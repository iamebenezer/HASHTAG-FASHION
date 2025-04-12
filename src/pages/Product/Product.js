import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import Image from "../../designLayouts/Image";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get product from location state or fetch from API
  useEffect(() => {
    if (location.state?.item) {
      setProduct(location.state.item);
      setLoading(false);
    } else {
      const productId = location.pathname.split("/").pop();
      fetchProduct(productId);
    }
  }, [location]);

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      const product = await apiService.products.getById(id);
      setProduct(product);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <Breadcrumbs 
        title="Products" 
        prevLocation={{ path: "/shop", text: "Shop" }} 
        currentLocation={product.productName} 
      />
      
      <div className="w-full flex flex-col md:flex-row gap-10">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <div className="border p-4">
            <Image className="w-full h-auto" imgSrc={product.img} />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
          <p className="text-xl text-primeColor font-semibold mb-4">
            ₦{product.price}
          </p>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.des}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Color:</span> {product.color}</li>
              {product.size && <li><span className="font-medium">Size:</span> {product.size}</li>}
              {product.material && <li><span className="font-medium">Material:</span> {product.material}</li>}
            </ul>
          </div>

          <button 
            onClick={() => navigate(-1)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
