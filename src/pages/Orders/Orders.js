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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="My Orders" />
      <div className="pb-10">
        <h1 className="text-2xl font-semibold mb-6">Order History</h1>
        {!orders || orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 mb-2">No orders found.</p>
            <p className="text-sm text-gray-400">Your order history will appear here once you make a purchase.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order?.id || index}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <p className="font-semibold text-lg">Order #{order?.id || `TEMP-${index + 1}`}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order?.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col md:items-end">
                      <p className="font-bold text-lg text-primeColor">₦{(order?.total_amount || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(order?.status)}`}>
                        {order?.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Shipping Details</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="mb-1"><span className="font-medium">Name:</span> {order?.customer?.name || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Email:</span> {order?.customer?.email || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Phone:</span> {order?.customer?.phone || 'N/A'}</p>
                      <p><span className="font-medium">Address:</span> {order?.customer?.address || 'N/A'}, {order?.customer?.city || ''}, {order?.customer?.state || ''} {order?.customer?.zip_code || ''}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Item</th>
                          <th className="text-center p-3">Color</th>
                          <th className="text-center p-3">Qty</th>
                          <th className="text-right p-3">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {order?.items?.map((item, itemIndex) => (
                          <tr key={itemIndex} className="hover:bg-gray-50">
                            <td className="p-3">
                              {item.product_name || `Product #${item.product_id}`}
                            </td>
                            <td className="p-3 text-center">
                              {item.color && (
                                <div className="flex items-center justify-center gap-1">
                                  <div 
                                    className="w-4 h-4 rounded-full border" 
                                    style={{ 
                                      backgroundColor: item.color.startsWith('#') ? item.color : undefined,
                                      border: '1px solid #ddd'
                                    }}
                                  ></div>
                                  <span>{item.color}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₦{(item.subtotal || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td colSpan="3" className="p-3 text-right">Subtotal:</td>
                          <td className="p-3 text-right">₦{(order?.subtotal || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="p-3 text-right">Shipping:</td>
                          <td className="p-3 text-right">₦{(order?.shipping_cost || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="font-bold">
                          <td colSpan="3" className="p-3 text-right">Total:</td>
                          <td className="p-3 text-right">₦{(order?.total_amount || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <p className="text-xs text-gray-500">
                      Payment Method: {order?.payment_method?.toUpperCase() || 'N/A'}
                      {order?.payment_reference && <span> • Ref: {order.payment_reference}</span>}
                    </p>
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