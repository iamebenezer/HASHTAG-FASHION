import React, { useEffect, useState } from "react";
import Heading from "../Products/Heading";
import Slider from "react-slick";
import Product from "../Products/Product";
import { apiService } from "../../../services/api";
import SampleNextArrow from "../NewArrivals/SampleNextArrow";
import SamplePrevArrow from "../NewArrivals/SamplePrevArrow";

const Tops = () => {
  const [tops, setTops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTops = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const categories = await apiService.categories.getAll();
        if (!categories || !Array.isArray(categories)) {
          console.log("Categories response:", categories);
          throw new Error('Invalid categories data received');
        }

        // Find tops category
        const topsCategory = categories.find(cat => 
          cat.name.toLowerCase().includes('top')
        );

        if (!topsCategory) {
          setError('Tops category not found');
          setTops([]);
          return;
        }

        // Fetch products for tops category
        const products = await apiService.products.getByCategory(topsCategory.id);
        
        // Handle the case where products might be nested in a data property
        const topsProducts = Array.isArray(products) ? products : 
                            (products && Array.isArray(products.data) ? products.data : []);
        
        if (!topsProducts || !Array.isArray(topsProducts)) {
          console.log("Products response:", products);
          throw new Error('Invalid products data format');
        }

        // Remove duplicates and invalid products
        const validProducts = topsProducts.filter(product => 
          product && product.id && product.name && product.price
        );
        
        // Create a Set of product IDs to ensure uniqueness
        const uniqueProductIds = new Set();
        const uniqueTops = validProducts.filter(product => {
          if (uniqueProductIds.has(product.id)) {
            return false;
          }
          uniqueProductIds.add(product.id);
          return true;
        });

        setTops(uniqueTops);
      } catch (err) {
        console.error('Error fetching tops:', err);
        setError(err.message || 'Failed to fetch tops');
        setTops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTops();
  }, []);

  // Determine if we should use infinite mode based on the number of products
  const shouldUseInfinite = tops.length > 4;

  const settings = {
    infinite: shouldUseInfinite,
    speed: 500,
    slidesToShow: Math.min(4, tops.length),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    dots: true,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: Math.min(3, tops.length),
          slidesToScroll: 1,
          infinite: shouldUseInfinite,
        },
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: Math.min(2, tops.length),
          slidesToScroll: 1,
          infinite: shouldUseInfinite,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: shouldUseInfinite,
        },
      },
    ],
  };

  return (
    <div className="w-full pb-16">
      <Heading heading="Tops" />
      <div className="w-full">
        {loading ? (
          <div className="text-center py-10">Loading tops...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : tops.length === 0 ? (
          <div className="text-center py-10">No tops available</div>
        ) : (
          <Slider {...settings} className="w-full">
            {tops.map((product) => (
              <div key={product.id} className="px-2">
                <Product
                  _id={product.id}
                  img={product.image_url || `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/storage/${product.image}`}
                  productName={product.name}
                  price={product.price}
                  color={product.color || "Various"}
                  badge={product.badge || false}
                  des={product.description || ""}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default Tops;
