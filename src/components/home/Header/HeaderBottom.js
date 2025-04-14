import React, { useState, useRef, useEffect } from "react";
import apiService from "../../../services/api";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { FaSearch, FaUser, FaCaretDown, FaShoppingCart } from "react-icons/fa";
import Flex from "../../designLayouts/Flex";
import { Link, useNavigate } from "react-router-dom";
import { paginationItems } from "../../../constants";
import { useCart } from "../../../context/CartContext";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const { cart } = useCart();
  
  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      if (ref.current.contains(e.target)) {
        setShow(true);
      } else {
        setShow(false);
      }
    });
  }, [show, ref]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) { // Only search when query has at least 3 characters
      setIsSearching(true);
      try {
        const results = await apiService.products.search(query);
        setFilteredProducts(results);
        setIsSearching(false);
      } catch (err) {
        console.error("Search error:", err);
        setFilteredProducts([]);
        setIsSearching(false);
      }
    } else {
      setFilteredProducts([]);
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product details page using the product ID
    navigate(`/product/${product.id}`, {
      state: {
        item: {
          _id: product.id,
          img: product.image_url,
          productName: product.name,
          price: product.price,
          color: product.colorVariants && product.colorVariants.length > 0 
            ? product.colorVariants[0].color_name 
            : "Default",
          des: product.description
        }
      }
    });
    setShowSearchBar(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full bg-[#F5F5F3] relative font-head">
      <div className="max-w-container mx-auto">
        <Flex className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full px-4 pb-4 lg:pb-0 h-full lg:h-24">
          <div
            onClick={() => setShow(!show)}
            ref={ref}
            className="flex h-14 cursor-pointer items-center gap-2 text-primeColor"
          >
            <HiOutlineMenuAlt4 className="w-5 h-5" />
            <p className="text-[14px] font-normal">Shop by Category</p>

            {show && (
              <motion.ul
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-36 z-50 bg-primeColor w-auto text-[#767676] h-auto p-4 pb-6"
              >
                <Link to="/shop">
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                Cap
                </li>
                </Link>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                Tops
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                Hoodies
                </li>
                <li className="text-gray-400 px-4 py-1 border-b-[1px] border-b-gray-400 hover:border-b-white hover:text-white duration-300 cursor-pointer">
                 Pants
                </li>
              </motion.ul>
            )}
          </div>
          <div className="relative w-full lg:w-[600px] h-[50px] text-base text-primeColor bg-white flex items-center gap-2 justify-between px-6 rounded-xl">
            <input
              className="flex-1 h-full outline-none placeholder:text-[#C4C4C4] placeholder:text-[14px]"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search your products here"
            />
            <FaSearch className="w-5 h-5" />
            {searchQuery && (
              <div
                className={`w-full mx-auto h-96 bg-white top-16 absolute left-0 z-50 overflow-y-scroll shadow-2xl scrollbar-hide cursor-pointer`}
              >
                {isSearching ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <p className="text-lg font-semibold text-primeColor">Searching...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <div
                      onClick={() => handleProductClick(item)}
                      key={item.id}
                      className="max-w-[600px] h-28 bg-gray-100 mb-3 flex items-center gap-3 px-4 hover:bg-gray-200 transition-all duration-300"
                    >
                      <img className="w-24 h-24 object-contain" src={item.image_url} alt={item.name} />
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-lg">
                          {item.name}
                        </p>
                        <p className="text-xs line-clamp-2">{item.description}</p>
                        <p className="text-sm">
                          Price:{" "}
                          <span className="text-primeColor font-semibold">
                          ₦{item.price}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex justify-center items-center">
                    <p className="text-lg font-semibold text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 lg:mt-0 items-center pr-6 cursor-pointer relative">
            <div onClick={() => setShowUser(!showUser)} className="flex">
              {/* <FaUser /> */}
              {/* <FaCaretDown /> */}
            </div>
            <Link to="/cart">
              <div className="relative">
                <FaShoppingCart />
                <span className="absolute font-titleFont top-3 -right-2 text-xs w-4 h-4 flex items-center justify-center rounded-full bg-primeColor text-white">
                  {cart.totalItems}
                </span>
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;
