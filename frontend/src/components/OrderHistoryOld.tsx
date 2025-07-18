import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  orderDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate order history (in a real app, this would come from the API)
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        bookTitle: 'The Great Gatsby',
        bookAuthor: 'F. Scott Fitzgerald',
        orderDate: new Date(Date.now() - 86400000), // 1 day ago
        status: 'completed'
      },
      {
        id: '2',
        bookTitle: '1984',
        bookAuthor: 'George Orwell',
        orderDate: new Date(Date.now() - 172800000), // 2 days ago
        status: 'completed'
      },
      {
        id: '3',
        bookTitle: 'To Kill a Mockingbird',
        bookAuthor: 'Harper Lee',
        orderDate: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'pending'
      }
    ];
    
    setOrders(mockOrders);
    setIsLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
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
      </div>
      
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.bookTitle}</p>
                  <p className="text-xs text-gray-500">by {order.bookAuthor}</p>
                  <p className="text-xs text-gray-400">
                    {order.orderDate.toLocaleDateString()} at {order.orderDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 