import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import Pagination from "../../components/pageProps/shopPage/Pagination";
import ProductBanner from "../../components/pageProps/shopPage/ProductBanner";
import ShopSideNav from "../../components/pageProps/shopPage/ShopSideNav";
import apiService from "../../services/api";
import { getCache, setCache } from "../../utils/cache";
import { formatPrice } from "../../utils/format";

const Shop = () => {
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = selectedCategory ? `products_category_${selectedCategory}` : 'products_all';
        const cached = getCache(cacheKey);
        if (cached) {
          setProducts(cached);
          setLoading(false);
          return;
        }
        let response;
        if (selectedCategory) {
          response = await apiService.products.getByCategory(selectedCategory);
        } else {
          response = await apiService.products.getAll();
        }
        let productsData = Array.isArray(response) ? response : 
                         (response && Array.isArray(response.data) ? response.data : []);
        if (!productsData || !Array.isArray(productsData)) {
          throw new Error('Invalid products data format');
        }
        productsData = productsData.map(product => ({
          _id: product.id,
          img: product.image_url || '/default-product-image.jpg',
          productName: product.name,
          price: formatPrice(product.price),
          des: product.description,
          color: product.color || 'N/A',
          badge: product.badge || false
        }));
        setProducts(productsData);
        setCache(cacheKey, productsData, 600000); // 10 minutes
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const itemsPerPageFromBanner = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Products" />
      {/* ================= Products Start here =================== */}
      <div className="w-full h-full flex pb-20 gap-10">
        <div className="w-[20%] lgl:w-[25%] hidden mdl:inline-flex h-full">
          <ShopSideNav 
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>
        <div className="w-full mdl:w-[80%] lgl:w-[75%] h-full flex flex-col gap-10">
          <ProductBanner itemsPerPageFromBanner={itemsPerPageFromBanner} />
          <Pagination
            products={products}
            itemsPerPage={itemsPerPage}
            loading={loading}
            error={error}
          />
        </div>
      </div>
      {/* ================= Products End here ===================== */}
    </div>
  );
};

export default Shop;
