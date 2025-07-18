import React, { useState, useEffect } from 'react';
import { Bell, X, Package } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: 'order' | 'system';
}

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate receiving notifications (in a real app, this would be WebSocket or SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new order notifications
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: `New order placed for book: ${['The Great Gatsby', '1984', 'To Kill a Mockingbird', 'Pride and Prejudice'][Math.floor(Math.random() * 4)]}`,
          timestamp: new Date(),
          type: 'order'
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          markAsRead();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Package className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel; 