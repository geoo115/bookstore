import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, Calendar } from 'lucide-react';
import { apiService, OrderHistory as OrderHistoryType } from '../services/api';
import toast from 'react-hot-toast';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      const orderData = await apiService.getOrderHistory();
      setOrders(orderData);
    } catch (error: any) {
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'processing':
        return 'text-yellow-800 bg-yellow-100';
      case 'shipped':
        return 'text-blue-800 bg-blue-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Package className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          {orders.length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-center">No orders yet</p>
          </div>
        ) : (
          orders
            .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
            .map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.book_title}</p>
                    <p className="text-xs text-gray-500">by {order.book_author}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(order.order_date).toLocaleDateString()} at{' '}
                      {new Date(order.order_date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">#{order.id}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
