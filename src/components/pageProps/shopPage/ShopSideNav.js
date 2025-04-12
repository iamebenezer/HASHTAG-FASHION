import React, { useState, useEffect } from "react";
import apiService from "../../../services/api";
import Brand from "./shopBy/Brand";
import Color from "./shopBy/Color";

const ShopSideNav = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.categories.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    onSelectCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const clearFilters = () => {
    onSelectCategory(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="filter-section">
        <h3 className="filter-title">Categories</h3>
        {loading ? (
          <div>Loading categories...</div>
        ) : (
          <ul className="category-list">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? "active" : ""}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}
        {selectedCategory && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>
      <Color />
      <Brand />
    </div>
  );
};

export default ShopSideNav;
