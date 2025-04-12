import React from "react";
import Heading from "../Products/Heading";
import Slider from "react-slick";
import Product from "../Products/Product";
import {
  
hoodieOne,
hoodieTwo,
hoodieThree,
hoodieFour,


} from "../../../assets/images/index";
import SampleNextArrow from "../NewArrivals/SampleNextArrow";
import SamplePrevArrow from "../NewArrivals/SamplePrevArrow";
const Hoodie = () => {
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
    <Heading heading="Hoodies" />
    <Slider {...settings}>
      <div className="px-2">
        <Product
          _id="100001"
          img={hoodieOne}
          productName="HASHTAG SNOW HOODIE"
          price="26,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color Hooded. Drawstring Casual Fleece Hoodie. Flock Design at front

"
        />
      </div>
      <div className="px-2">
        <Product
          _id="100002"
          img={hoodieTwo}
          productName="HASHTAG OVERSIZED ZIP-UP HOODIE"
          price="20,000

"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color Hooded. Drawstring Casual Fleece Hoodie. Flux Design at front. Metal Zipper "
        />
      </div>
      <div className="px-2">
        <Product
          _id="100003"
          img={hoodieThree}
          productName="HASHTAG BLOCK HOODIE"
          price="26,000"
          color="Black, Ash & Brown"
          // badge={true}
          des="100% Cotton Solid Color Hooded. Drawstring Casual Fleece Hoodie. Flock Design at front."
        />
      </div>
      <div className="px-2">
        <Product
          _id="100004"
          img={hoodieFour}
          productName="HASHTAG CROPPED ZIP-UP HOODIE"
          price="22,000"
          color="Blank, Brown & Ash"
          badge={false}
          des="100% Cotton Solid Color Hooded. Drawstring Casual Fleece Hoodie. Flux Design at front. Cropped and mainly for Women. Metal Zipper."
        />
      </div>
     
      
    </Slider>
  </div>
  );
};

export default Hoodie;
