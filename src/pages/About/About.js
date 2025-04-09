import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import {
  modelSeven
} from "../../assets/images";
const About = () => {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState("");
  useEffect(() => {
    setPrevLocation(location.state.data);
  }, [location]);
  return (
    <div className=" max-w-container mx-auto px-4">
      <Breadcrumbs  title="About" prevLocation={prevLocation} />
        <div className="md:grid-cols-2 grid-cols-1 grid place-items-center"> 
      <div>
      <div className="pb-10">
        <h1 className="max-w-[600px] text-base text-lightText mb-2">
          <span className="text-primeColor font-semibold text-lg">Hashtag Fashion Design Brand</span>{" "}
         Where fashion transcends beyond mere clothing to become an integral part of your lifestyle. At Hashtag, we believe that what you wear should reflect who you are, your aspirations, and your unique journey. Our designs are crafted with the utmost attention to detail, quality, and innovation, ensuring that every piece not only enhances your wardrobe but also resonates with your personal story.
          <br/>
          Our collections are inspired by the vibrant, dynamic world around us, blending contemporary trends with timeless elegance. Whether you're dressing for a casual day out, a special occasion, or simply want to express your individuality, Hashtag Fashion Design Brand is here to make every moment stylish and memorable.

Join us in redefining fashion as more than just clothes—embrace it as a lifestyle. Welcome to the Hashtag community, where style meets substance.
        </h1>
        <Link to="/shop">
          <button className="w-52 h-16 font-cloth bg-primeColor text-white hover:bg-black duration-300">
            Continue Shopping
          </button>
        </Link>
      </div>

      </div>
        
        <div className="pb-10">
          <img src={modelSeven} className="w-96"/>
        </div>

      </div>
    </div>
  );
};

export default About;
