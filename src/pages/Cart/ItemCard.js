import React from "react";
import { ImCross } from "react-icons/im";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";

const ItemCard = ({ item, onUpdate }) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleRemoveItem = () => {
    removeFromCart(item.id, item.color);
    if (onUpdate) onUpdate();
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity <= 1) return;
    updateQuantity(item.id, item.color, item.quantity - 1);
    if (onUpdate) onUpdate();
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, item.color, item.quantity + 1);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="w-full grid grid-cols-5 mb-4 border py-2">
      <div className="flex col-span-5 mdl:col-span-2 items-center gap-4 ml-4">
        <ImCross
          onClick={handleRemoveItem}
          className="text-primeColor hover:text-red-500 duration-300 cursor-pointer"
        />
        <img className="w-32 h-32 object-contain" src={item.img} alt="productImage" />
        <div>
          <h1 className="font-titleFont font-semibold">{item.productName}</h1>
          <p className="text-sm text-gray-500">
            {item.color && (
              <span className="flex items-center gap-1">
                <span>Color:</span>
                <span 
                  className="inline-block w-3 h-3 rounded-full border border-gray-300" 
                  style={{ 
                    backgroundColor: item.color && item.color.startsWith('#') ? item.color : undefined
                  }}
                ></span>
                <span>{item.color}</span>
              </span>
            )}
            {item.size && (
              <span className="flex items-center gap-1 ml-4">
                <span>Size:</span>
                <span className="inline-block px-2 py-1 bg-gray-200 text-xs rounded">{item.size}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="col-span-5 mdl:col-span-3 flex items-center justify-between py-4 mdl:py-0 px-4 mdl:px-0 gap-6 mdl:gap-0">
        <div className="flex w-1/3 items-center text-lg font-semibold">
          {formatPrice(item.price)}
        </div>

        <div className="w-1/3 flex items-center gap-6 text-lg">
          <span
            onClick={handleDecreaseQuantity}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300 hover:border-gray-500"
          >
            -
          </span>
          <p>{item.quantity}</p>
          <span
            onClick={handleIncreaseQuantity}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300 hover:border-gray-500"
          >
            +
          </span>
        </div>

        <div className="w-1/3 flex items-center font-titleFont font-bold text-lg">
          <p>
            {(() => {
              let price = item.price;
              if (typeof price === 'string') {
                price = price.replace(/₦/g, '').replace(/,/g, '');
              }
              price = parseFloat(price);
              if (isNaN(price)) return formatPrice(0);
              const total = price * item.quantity;
              return formatPrice(total);
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
