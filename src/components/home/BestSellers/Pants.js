import React from "react";
import Heading from "../Products/Heading";
import Slider from "react-slick";
import Product from "../Products/Product";
import {
  
  pantsOne,
  pantsTwo,
  pantsThree,
  pantsFour,
  pantsFive,


} from "../../../assets/images/index";
import SampleNextArrow from "../NewArrivals/SampleNextArrow";
import SamplePrevArrow from "../NewArrivals/SamplePrevArrow";
const Pants = () => {
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
    <Heading heading="Pants" />
    <Slider {...settings}>
      <div className="px-2">
        <Product
          _id="100001"
          img={pantsOne}
          productName="HASHTAG SNOW PANTS
"
          price="22,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flock Design at front. Comfy  Waist Elastic Band. Drawstring Casual Fleece Pants.

"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100002"
          img={pantsTwo}
          productName="HASHTAG SNOW JOGGERS"
          price="20,000

"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flock Design at front. Comfy  Waist and Ankle Elastic Band. Drawstring Casual Fleece Joggers. "
        />
      </div>
      <div className="px-2">
        <Product
          _id="100003"
          img={pantsThree}
          productName="HASHTAG GECK JOGGERS
"
          price="20,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color. Flux Design at front. Comfy  Waist and Ankle Elastic Band. Drawstring Casual Fleece Joggers."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100004"
          img={pantsFour}
          productName="HASHTAG BLOCK JOGGERS"
          price="20,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flock Design at front. Comfy  Waist and Ankle Elastic Band. Drawstring Casual Fleece Joggers.."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100004"
          img={pantsFive}
          productName="HASHTAG GECK PANTS"
          price="22,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color. Flux Design at front. Comfy  Waist Elastic Band. Drawstring Casual Fleece Pants."
        />
      </div>
     
      
    </Slider>
  </div>
  );
};

export default Pants;
