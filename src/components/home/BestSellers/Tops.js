import React from "react";
import Heading from "../Products/Heading";
import Slider from "react-slick";
import Product from "../Products/Product";
import {
  tankOne,
  shirtOne,
  sweatOne,
  fourShirt,
  shirtThree,
  sweatTwo,
  tankTwo,
  shirtFour,
  twoShirt,
  shirtFive,


} from "../../../assets/images/index";
import SampleNextArrow from "../NewArrivals/SampleNextArrow";
import SamplePrevArrow from "../NewArrivals/SamplePrevArrow";
const tops = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
        },
      },
    ],
  }
  return (
    <div className="w-full pb-16">
    <Heading heading="Tops" />
    <Slider {...settings}>
      <div className="px-2">
        <Product
          _id="100001"
          img={tankOne}
          productName="HASHTAG GECK TANK TOP"
          price="12,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flux Design at front. Comfy Neck Band on the Shirt. No sleeves.

"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100002"
          img={shirtOne}
          productName="HASHTAG CROPPED TOP"
          price="10,000

"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck Band on the Shirt. Cropped and mainly for Women"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100003"
          img={sweatOne}
          productName="HASHTAG BLOCK SWEATSHIRT"
          price="20,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck and Wrist Elastic Band."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100004"
          img={fourShirt}
          productName="HASHTAG MIX 1 TEES"
          price="16,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck Band on the Shirt"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100005"
          img={shirtThree}
          productName="HASHTAG BLOCK TEES"
          price="15,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck Band on the Shirt"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100006"
          img={sweatTwo}
          productName="HASHTAG GECK SWEATSHIRT"
          price="20,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck and Wrist Elastic Band."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100007"
          img={tankTwo}
          productName="HASHTAG GYM TANK TOP"
          price="12,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Monogram Design at front. Comfy Neck Band on the Shirt. No sleeves."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100008"
          img={shirtFour}
          productName="HASHTAG GECK CROPPED"
          price="20,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck Band on the Shirt. Cropped and mainly for Men."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100009"
          img={twoShirt}
          productName="HASHTAG MIX 2 TEES"
          price="15,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy Neck Band on the Shirt"
        />
      </div>
    
      
    </Slider>
  </div>
  );
};

export default tops;
