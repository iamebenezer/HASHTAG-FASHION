import React from "react";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import {
  capOne,
 
  capTwo,
  capThree,
  capFour,
  
} from "../../../assets/images/index";
import SampleNextArrow from "./SampleNextArrow";
import SamplePrevArrow from "./SamplePrevArrow";

const NewArrivals = () => {
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
  };
  return (
    <div className="w-full pb-16">
      <Heading heading="Caps" />
      <Slider {...settings}>
        <div className="px-2">
          <Product
            _id="100001"
            img={capOne}
            productName="HASHTAG BASEBALL HAT
"
            price="12,000"
            color="Mxied"
            // badge={true}
            des="100% Cotton, Soft Gum-Stay in front, Plastic Adjustable Clip at the back, Cotton Net back cover"
          />
        </div>
        <div className="px-2">
          <Product
            _id="100002"
            img={capTwo}
            productName="HASHTAG TUNKER HAT"
            price="5,000"
            color="Mixed"
            // badge={true}
            des="100% Cotton, Soft Foam in front, Plastic Adjustable Clip at the back, Cotton Net back cover."
          />
        </div>
        <div className="px-2">
          <Product
            _id="100003"
            img={capThree}
            productName="HASHTAG WAVE CAP"
            price="5,000"
            color="Mixed"
            // badge={true}
            des="100% Cotton, Soft Comfortable Band Around the edges. Expandable Rubber Like Texture."
          />
        </div>
        <div className="px-2">
          <Product
            _id="100004"
            img={capFour}
            productName="HASHTAG SNAPBACK HAT"
            price="12,000"
            color="Mixed"
            badge={false}
            des="100% Cotton, Soft Gum-Stay in front, Plastic Adjustable Clip at the back, Cotton Net back cover"
          />
        </div>
      
      </Slider>
    </div>
  );
};

export default NewArrivals;
