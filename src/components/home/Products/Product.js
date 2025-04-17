import React, { useState, memo } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { GiReturnArrow } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { MdOutlineLabelImportant } from "react-icons/md";
import Image from "../../designLayouts/Image";
import Badge from "./Badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import apiService from "../../../services/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Product = memo((props) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const productItem = props;

  // Use colorVariants directly from props, fallback to color_variants (API snake_case)
  const colorVariants = props.colorVariants && Array.isArray(props.colorVariants) && props.colorVariants.length > 0
    ? props.colorVariants
    : (props.color_variants && Array.isArray(props.color_variants) ? props.color_variants : []);
  const hasColorVariants = colorVariants.length > 0;

  // Use the actual product ID for navigation instead of the product name
  const handleProductDetails = () => {
    const productId = props.id || props._id;
    navigate(`/product/${productId}`, {
      state: {
        item: { ...props, id: productId },
      },
    });
  };

  const handleAddToCart = (e) => {
    // Stop event propagation to prevent navigating to product details
    if (e) e.stopPropagation();
    
    // If product has color variants, redirect to product details page
    if (hasColorVariants) {
      toast.info("Please select a color variant on the product page");
      setTimeout(() => {
        handleProductDetails();
      }, 1000);
      return;
    }
    
    try {
      setIsAddingToCart(true);
      
      // Add to local cart context
      const cartItem = {
        id: props.id || props._id,
        productName: props.productName,
        price: props.price,
        img: props.img,
        color: props.color || "Default",
        quantity: 1,
        description: props.des || "",
      };
      
      console.log("Adding to cart:", cartItem);
      
      addToCart(cartItem);
      
      // Show success feedback
      toast.success("Added to cart successfully!");
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="w-full relative group">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-80 max-h-80 relative overflow-y-hidden cursor-pointer" onClick={handleProductDetails}>
        <div>
          <Image className="w-full h-full" imgSrc={props.img} onLoad={() => setImageLoaded(true)} />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="w-20 h-20 bg-gray-300 rounded-full" />
            </div>
          )}
        </div>
        <div className="absolute top-6 left-8">
          {props.badge && <Badge text="New" />}
        </div>
        {/* Render color swatches if colorVariants exist */}
        {hasColorVariants && (
          <div className="flex gap-2 mt-2 px-2">
            {colorVariants.map(variant => (
              <span
                key={variant.id}
                style={{
                  backgroundColor: variant.color_code,
                  border: '1px solid #ccc',
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                }}
                title={variant.color_name}
              />
            ))}
          </div>
        )}
        <div className="w-full h-20 absolute bg-white -bottom-[80px] group-hover:bottom-0 duration-500">
          <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleProductDetails();
              }}
              className="text-primeColor hover:text-black cursor-pointer flex items-center gap-1"
            >
              <MdOutlineLabelImportant /> Details
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-80 py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4">
        <div className="flex items-center justify-between font-titleFont">
          <h2 className="text-lg text-primeColor font-bold">
            {props.productName}
          </h2>
          <p className="text-[#767676] text-[14px]">{props.price}</p>
        </div>
        <div>
          {/* Hardcode color variant label for now */}
          <p className="text-xs text-gray-600 mt-1">Multiple color variants</p>
        </div>
      </div>
    </div>
  );
});

export default Product;
