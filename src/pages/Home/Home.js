import React from "react";
import Banner from "../../components/Banner/Banner";
import BannerBottom from "../../components/Banner/BannerBottom";
import Tops from "../../components/home/BestSellers/Tops";
import Hoodie from "../../components/home/BestSellers/Hoodie";
import Pants from "../../components/home/BestSellers/Pants";
import NewArrivals from "../../components/home/NewArrivals/NewArrivals";
import Sale from "../../components/home/Sale/Sale";
import SpecialOffers from "../../components/home/SpecialOffers/SpecialOffers";
import YearProduct from "../../components/home/YearProduct/YearProduct";

const Home = () => {
  return (
    <div className="w-full mx-auto">
      <Banner />
      <BannerBottom />
      <div className="max-w-container mx-auto px-4">
        <Sale />
        <NewArrivals />
        <Tops />
        <Hoodie/>
        <Pants/>
        <YearProduct />
        {/* <SpecialOffers /> */}
      </div>
    </div>
  );
};

export default Home;
