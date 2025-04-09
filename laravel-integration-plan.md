# Laravel Backend Integration Plan for HASHTAG-FASHION

## Overview

This document outlines the plan for integrating a Laravel backend API with the existing React frontend for HASHTAG-FASHION. The backend will serve as a RESTful API for the frontend and will include an admin dashboard built with Laravel.

## Architecture

```
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|  React Frontend   | <--> |   Laravel API    | <--> |     Database      |
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
                                    |
                                    v
                           +-------------------+
                           |                   |
                           |  Admin Dashboard  |
                           |                   |
                           +-------------------+
```

## Required Laravel Packages

1. **Laravel Sanctum** - For API authentication
2. **Laravel Nova/Voyager/Backpack** - For admin dashboard
3. **Laravel CORS** - For handling Cross-Origin Resource Sharing
4. **Laravel Eloquent** - For database ORM
5. **Laravel Passport** - If OAuth authentication is needed

## API Endpoints

Based on the current React frontend, we'll need the following API endpoints:

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/user
```

### Products

```
GET /api/products - List all products with pagination
GET /api/products/{id} - Get a specific product
GET /api/products/featured - Get featured products
GET /api/products/categories/{category} - Get products by category
POST /api/products (Admin) - Create a product
PUT /api/products/{id} (Admin) - Update a product
DELETE /api/products/{id} (Admin) - Delete a product
```

### Cart

```
GET /api/cart - Get user's cart
POST /api/cart/add - Add item to cart
PUT /api/cart/update/{id} - Update cart item quantity
DELETE /api/cart/remove/{id} - Remove item from cart
DELETE /api/cart/clear - Clear cart
```

### Orders

```
GET /api/orders - Get user's orders
GET /api/orders/{id} - Get specific order
POST /api/orders - Create a new order
GET /api/orders/{id}/status - Check order status
```

### User Profile

```
GET /api/user/profile - Get user profile
PUT /api/user/profile - Update user profile
```

## Database Schema

### Users Table
- id (primary key)
- name
- email
- password
- role (user, admin)
- created_at
- updated_at

### Products Table
- id (primary key)
- name
- description
- price
- image_url
- category_id (foreign key)
- colors (JSON)
- badge (boolean)
- created_at
- updated_at

### Categories Table
- id (primary key)
- name
- slug
- created_at
- updated_at

### Cart Items Table
- id (primary key)
- user_id (foreign key)
- product_id (foreign key)
- quantity
- created_at
- updated_at

### Orders Table
- id (primary key)
- user_id (foreign key)
- total_amount
- shipping_address
- status
- created_at
- updated_at

### Order Items Table
- id (primary key)
- order_id (foreign key)
- product_id (foreign key)
- quantity
- price
- created_at
- updated_at

## Frontend Integration

### API Service

Create a new API service in the React frontend to handle API calls to the Laravel backend:

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // for cookies/session authentication
});

// Request interceptor for adding the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Redux Integration

Update the Redux store to use the API service for data fetching:

```javascript
// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Similar thunks for other API calls
```

## Laravel Setup Steps

1. **Create a new Laravel project**
   ```bash
   composer create-project laravel/laravel hashtag-fashion-api
   ```

2. **Install required packages**
   ```bash
   composer require laravel/sanctum
   composer require laravel/nova # or voyager or backpack
   composer require fruitcake/laravel-cors
   ```

3. **Configure database connection**
   Update `.env` file with database credentials

4. **Run migrations**
   ```bash
   php artisan migrate
   ```

5. **Set up Sanctum for authentication**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

6. **Configure CORS**
   Update `config/cors.php` to allow requests from the React frontend

7. **Create API controllers and routes**
   Implement the API endpoints listed above

8. **Set up the admin dashboard**
   Configure Nova/Voyager/Backpack for the admin interface

## Recommended Premium Packages

1. **Laravel Nova** ($199 for solo license) - A beautifully designed administration panel for Laravel
   - https://nova.laravel.com/

2. **Laravel Backpack** ($69-$299) - A collection of packages that help you build custom admin panels
   - https://backpackforlaravel.com/

3. **Laravel Voyager** (Free) - A fully functional admin panel with CRUD operations
   - https://voyager.devdojo.com/

4. **Laravel Cashier** - For subscription billing integration
   - https://laravel.com/docs/billing

5. **Laravel Horizon** - For queue monitoring (useful for processing orders)
   - https://laravel.com/docs/horizon

## Development Workflow

1. Set up the Laravel backend with authentication and basic API endpoints
2. Configure the admin dashboard using one of the recommended packages
3. Update the React frontend to use the new API endpoints
4. Test the integration thoroughly
5. Deploy both the Laravel backend and React frontend

## Deployment Considerations

1. **Separate Deployments**: Deploy the Laravel backend and React frontend separately
2. **Environment Variables**: Use environment variables for API URLs and other configuration
3. **CORS Configuration**: Ensure CORS is properly configured for production
4. **SSL**: Use SSL certificates for secure communication
5. **Database Backups**: Set up regular database backups

## Next Steps

1. Choose the admin dashboard package (Nova, Voyager, or Backpack)
2. Set up the Laravel project structure
3. Implement the authentication system
4. Create the product management API
5. Integrate the React frontend with the new API