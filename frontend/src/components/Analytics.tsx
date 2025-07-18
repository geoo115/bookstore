import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { apiService, BookStats, OrderHistory, User } from '../services/api';
import toast from 'react-hot-toast';

interface AnalyticsData {
  bookStats: BookStats | null;
  orderHistory: OrderHistory[];
  users: User[];
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    bookStats: null,
    orderHistory: [],
    users: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load current user first to check permissions
      const userData = await apiService.getUserProfile();
      setCurrentUser(userData);

      // Load book statistics
      const bookStatsPromise = apiService.getBookStats();
      
      // Load order history
      const orderHistoryPromise = userData.role === 'admin' 
        ? apiService.getAllOrders() 
        : apiService.getOrderHistory();

      // Load users (admin only)
      const usersPromise = userData.role === 'admin' 
        ? apiService.getAllUsers() 
        : Promise.resolve([]);

      const [bookStats, orderHistory, users] = await Promise.all([
        bookStatsPromise,
        orderHistoryPromise,
        usersPromise
      ]);

      setData({ bookStats, orderHistory, users });
    } catch (error: any) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStats = () => {
    const totalOrders = data.orderHistory.length;
    const completedOrders = data.orderHistory.filter(order => order.status === 'completed').length;
    const recentOrders = data.orderHistory.filter(order => {
      const orderDate = new Date(order.order_date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }).length;

    return { totalOrders, completedOrders, recentOrders };
  };

  const getTopBooks = () => {
    const bookCounts: { [key: string]: { title: string; author: string; count: number } } = {};
    
    data.orderHistory.forEach(order => {
      const key = order.book_id;
      if (bookCounts[key]) {
        bookCounts[key].count++;
      } else {
        bookCounts[key] = {
          title: order.book_title,
          author: order.book_author,
          count: 1
        };
      }
    });

    return Object.values(bookCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const orderStats = getOrderStats();
  const topBooks = getTopBooks();

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Books</h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.bookStats?.total_books || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="text-2xl font-bold text-green-600">{orderStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <p className="text-2xl font-bold text-purple-600">{orderStats.recentOrders}</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-2xl font-bold text-orange-600">{data.users.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Authors */}
        {data.bookStats && data.bookStats.top_authors.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Authors</h3>
            <div className="space-y-3">
              {data.bookStats.top_authors.slice(0, 5).map((author, index) => (
                <div key={author.author} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{author.author}</span>
                  </div>
                  <span className="text-sm text-gray-500">{author.count} books</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Ordered Books */}
        {topBooks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Ordered Books</h3>
            <div className="space-y-3">
              {topBooks.map((book, index) => (
                <div key={`${book.title}-${book.author}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.author}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{book.count} orders</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {data.orderHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Order Activity</h3>
          <div className="space-y-3">
            {data.orderHistory
              .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
              .slice(0, 10)
              .map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.book_title}</p>
                      <p className="text-xs text-gray-500">
                        {currentUser?.role === 'admin' ? `by ${order.username}` : `by ${order.book_author}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
