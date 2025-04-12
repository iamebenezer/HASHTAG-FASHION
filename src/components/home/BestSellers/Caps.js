import React, { useEffect, useState } from "react";
import Heading from "../Products/Heading";
import Slider from "react-slick";
import Product from "../Products/Product";
import { apiService } from "../../../services/api";
import SampleNextArrow from "../NewArrivals/SampleNextArrow";
import SamplePrevArrow from "../NewArrivals/SamplePrevArrow";

const Caps = () => {
  const [caps, setCaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaps = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories
        const categories = await apiService.categories.getAll();
        if (!categories || !Array.isArray(categories)) {
          console.log("Categories response:", categories);
          throw new Error('Invalid categories data received');
        }

        // Find caps category
        const capsCategory = categories.find(cat => 
          cat.name.toLowerCase().includes('cap')
        );

        if (!capsCategory) {
          setError('Caps category not found');
          setCaps([]);
          return;
        }

        // Fetch products for caps category
        const products = await apiService.products.getByCategory(capsCategory.id);
        
        // Handle the case where products might be nested in a data property
        const capsProducts = Array.isArray(products) ? products : 
                            (products && Array.isArray(products.data) ? products.data : []);
        
        if (!capsProducts || !Array.isArray(capsProducts)) {
          console.log("Products response:", products);
          throw new Error('Invalid products data format');
        }

        // Remove duplicates and invalid products
        const validProducts = capsProducts.filter(product => 
          product && product.id && product.name && product.price
        );
        
        // Create a Set of product IDs to ensure uniqueness
        const uniqueProductIds = new Set();
        const uniqueCaps = validProducts.filter(product => {
          if (uniqueProductIds.has(product.id)) {
            return false;
          }
          uniqueProductIds.add(product.id);
          return true;
        });

        setCaps(uniqueCaps);
      } catch (err) {
        console.error('Error fetching caps:', err);
        setError(err.message || 'Failed to fetch caps');
        setCaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaps();
  }, []);

  // Determine if we should use infinite mode based on the number of products
  const shouldUseInfinite = caps.length > 4;

  const settings = {
    infinite: shouldUseInfinite,
    speed: 500,
    slidesToShow: Math.min(4, caps.length),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    dots: true,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: Math.min(3, caps.length),
          slidesToScroll: 1,
          infinite: shouldUseInfinite,
        },
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: Math.min(2, caps.length),
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
      <Heading heading="Caps" />
      <div className="w-full">
        {loading ? (
          <div className="text-center py-10">Loading caps...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : caps.length === 0 ? (
          <div className="text-center py-10">No caps available</div>
        ) : (
          <Slider {...settings} className="w-full">
            {caps.map((product) => (
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

export default Caps;