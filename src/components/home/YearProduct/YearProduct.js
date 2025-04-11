import React from "react";
import { Link } from "react-router-dom";
import { productOfTheYear } from "../../../assets/images";
import ShopNow from "../../designLayouts/buttons/ShopNow";
import Image from "../../designLayouts/Image";

const YearProduct = () => {
  return (
    <Link to="/shop">
      <div className="grid md:grid-cols-2 grid-cols-1 w-fit  ">
      <div>
        <img
          className="w-[2500px] md:inline-block"
          src={productOfTheYear}
        />
        </div>
        <div className="w-full space-y-4 mb-4">
          <h1 className="text-3xl font-cloth text-primeColor">
            Product of The year
          </h1>
          <p className="text-base font-normal text-primeColor max-w-[600px] mr-4">
          INTRODUCING THE HASHTAG FASHION BRAND STRIPE T-SHIRT, A RANGE
           INSPIRED BY VINTAGE WEARS. WHERE LIKE-MINDED INDIVIDUALS CAN SHARE THEIR PASSIONS. WE BRANDED HASHTAG FASHION BRAND TO BE 'FOR ANTHUSISSTS, BY ANTHUSISSTS'. TO CREATE GARMENTS WHICH CAN BE WORN BY CUSTOMERS TO ACKNOWLEDGE THEIR PASSION FOR THE BRAND.
          </p>
          <ShopNow />
        </div>
      </div>
    </Link>
  );
};

export default YearProduct;
