import React, { useState, useEffect, useRef } from "react";
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

const Product = (props) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [colorVariants, setColorVariants] = useState([]);
  const [hasColorVariants, setHasColorVariants] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const productItem = props;
  
  // Fetch color variants when component mounts
  useEffect(() => {
    const fetchColorVariants = async () => {
      try {
        const product = await apiService.products.getById(props._id);
        if (product && product.color_variants && product.color_variants.length > 0) {
          console.log("Fetched color variants:", product.color_variants);
          setColorVariants(product.color_variants);
          setHasColorVariants(true);
        }
      } catch (error) {
        console.error("Error fetching color variants:", error);
      }
    };
    
    fetchColorVariants();
  }, [props._id]);
  
  // Use the actual product ID for navigation instead of the product name
  const handleProductDetails = () => {
    navigate(`/product/${props._id}`, {
      state: {
        item: productItem,
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
        id: props._id,
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
        </div>
        <div className="absolute top-6 left-8">
          {props.badge && <Badge text="New" />}
        </div>
        <div className="w-full h-20 absolute bg-white -bottom-[80px] group-hover:bottom-0 duration-500">
          <ul className="w-full h-full flex flex-col items-end justify-center gap-2 font-titleFont px-2 border-l border-r">
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
              className={`text-[#767676] hover:text-primeColor text-sm font-normal border-b border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full ${isAddingToCart ? 'text-primeColor' : ''}`}
            >
              {isAddingToCart ? "Adding..." : hasColorVariants ? "Select Color Options" : "Add to Cart"}
              <span>
                <FaShoppingCart />
              </span>
            </li>
            <li
              onClick={(e) => {
                e.stopPropagation();
                handleProductDetails();
              }}
              className="text-[#767676] hover:text-primeColor text-sm font-normal border-b border-b-gray-200 hover:border-b-primeColor flex items-center justify-end gap-2 hover:cursor-pointer pb-1 duration-300 w-full"
            >
              View Details
              <span className="text-lg">
                <MdOutlineLabelImportant />
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-80 py-6 flex flex-col gap-1 border-[1px] border-t-0 px-4">
        <div className="flex items-center justify-between font-titleFont">
          <h2 className="text-lg text-primeColor font-bold">
            {props.productName}
          </h2>
          <p className="text-[#767676] text-[14px]">₦{props.price}</p>
        </div>
        <div>
          <p className="text-[#767676] text-[14px]">
            {hasColorVariants ? `${colorVariants.length} Color Options Available` : props.color || "Default"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Product;
