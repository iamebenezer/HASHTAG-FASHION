import React from 'react';
import { useSelector } from 'react-redux';
import Breadcrumbs from '../../components/pageProps/Breadcrumbs';

const Orders = () => {
  const { orders = [] } = useSelector((state) => state.orebiReducer);
  
  if (!Array.isArray(orders)) {
    return (
      <div className="max-w-container mx-auto px-4">
        <Breadcrumbs title="My Orders" />
        <div className="pb-10">
          <h1 className="text-2xl font-semibold mb-6">Order History</h1>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="My Orders" />
      <div className="pb-10">
        <h1 className="text-2xl font-semibold mb-6">Order History</h1>
        {!orders || orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order?.id || index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order?.id || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date not available'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{order?.total_amount?.toFixed(2) || '0.00'}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      {order?.status || 'unknown'}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm mb-2">
                    <span className="font-medium">Shipping Address:</span>{' '}
                    {order?.customer?.address || 'N/A'}, {order?.customer?.city || ''},{' '}
                    {order?.customer?.state || ''}
                  </p>
                  <div className="space-y-2">
                    {order?.items?.map((item, itemIndex) => (
                      <div
                        key={item?.product_id || itemIndex}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.product_name || 'Product'}
                        </span>
                        <span>₦{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;