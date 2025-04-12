import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Heading from "../Products/Heading";
import Product from "../Products/Product";
import { apiService } from "../../../services/api";
import SampleNextArrow from "./SampleNextArrow";
import SamplePrevArrow from "./SamplePrevArrow";

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const products = await apiService.products.getAll();
        // Sort by created_at in descending order and take the first 4
        const latestProducts = products
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);
        setNewProducts(latestProducts);
      } catch (err) {
        setError(err.message || 'Failed to fetch new products');
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

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

  if (loading) return <div className="text-center py-4">Loading new arrivals...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (newProducts.length === 0) return <div className="text-center py-4">No new products found</div>;

  return (
    <div className="w-full pb-16">
      <Heading heading="New Arrivals" />
      <Slider {...settings}>
        {newProducts.map((item) => (
          <div key={item.id} className="px-2">
            <Product
              _id={item.id}
              img={item.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
              productName={item.name}
              price={item.price}
              color={item.color || "Mixed"}
              des={item.description}
              badge={true}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default NewArrivals;
