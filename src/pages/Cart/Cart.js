import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { resetCart } from "../../redux/orebiSlice";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";

const Cart = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.orebiReducer.products);
  const [totalAmt, setTotalAmt] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);

  useEffect(() => {
    const total = products.reduce(
      (acc, item) => {
        //Dotmart code :: we have to  Parse the price string by removing commas before converting to number
        const price = typeof item.price === 'string' 
          ? parseFloat(item.price.replace(/,/g, '')) 
          : Number(item.price);
        return acc + price * Number(item.quantity);
      },
      0
    );
    setTotalAmt(total);
  }, [products]);

  useEffect(() => {
    if (totalAmt <= 200) {
      setShippingCharge(30);
    } else if (totalAmt <= 400) {
      setShippingCharge(25);
    } else {
      setShippingCharge(20);
    }
  }, [totalAmt]);

  const finalTotal = totalAmt + shippingCharge;

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Cart" />
      {products.length > 0 ? (
        <div className="pb-20">
          <div className="w-full h-20 bg-[#F5F7F7] text-primeColor hidden lgl:grid grid-cols-5 place-content-center px-6 text-lg font-titleFont font-semibold">
            <h2 className="col-span-2">Product</h2>
            <h2>Price</h2>
            <h2>Quantity</h2>
            <h2>Subtotal</h2>
          </div>

          <div className="mt-5">
            {products.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          <button
            onClick={() => dispatch(resetCart())}
            className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300"
          >
            Reset Cart
          </button>

          <div className="max-w-7xl gap-4 flex justify-end mt-4">
            <div className="w-96 flex flex-col gap-4">
              <h1 className="text-2xl font-semibold text-right">Cart Totals</h1>
              <div>
                <p className="flex items-center justify-between border border-gray-400 py-1.5 text-lg px-4 font-medium">
                  Shipping
                  <span>₦{shippingCharge.toLocaleString()}</span>
                </p>
                <p className="flex items-center justify-between border border-t-0 border-gray-400 py-1.5 text-lg px-4 font-medium">
                  Total
                  <span className="font-bold text-lg font-titleFont">
                    ₦{finalTotal.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="flex justify-end">
                <Link to="/paymentgateway">
                  <button className="w-52 h-10 bg-primeColor text-white hover:bg-black duration-300">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col mdl:flex-row justify-center items-center gap-4 pb-20"
        >
          <img className="w-80 p-4" src={emptyCart} alt="emptyCart" />
          <div className="max-w-[500px] p-4 py-8 bg-white flex flex-col items-center rounded-md shadow-lg gap-4">
            <h1 className="font-titleFont text-xl font-bold uppercase">
              Your Cart feels lonely.
            </h1>
            <p className="text-sm text-center px-10">
              Your shopping cart lives to serve. Fill it and make it happy!
            </p>
            <Link to="/shop">
              <button className="bg-primeColor hover:bg-black px-8 py-2 text-white font-semibold rounded-md duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
