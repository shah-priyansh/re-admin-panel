import { useState, useEffect } from 'react';
import {
  UsersIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../services/dashboardService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayRegistrations: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalProducts: 0,
    todayProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: "Today's Registration",
      value: stats.todayRegistrations.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-blue-400',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: "Today's Orders",
      value: stats.todayOrders.toLocaleString(),
      icon: ChartBarIcon,
      color: 'bg-purple-400',
    },
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: ShoppingBagIcon,
      color: 'bg-green-500',
    },
    {
      name: "Today's Products",
      value: stats.todayProducts.toLocaleString(),
      icon: ShoppingBagIcon,
      color: 'bg-green-400',
    },
  ];

  const recentActivities = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Order placed', user: 'Jane Smith', time: '15 minutes ago' },
    { id: 3, action: 'Product updated', user: 'Admin', time: '1 hour ago' },
    { id: 4, action: 'Payment received', user: 'Mike Johnson', time: '2 hours ago' },
    { id: 5, action: 'User verified', user: 'Sarah Wilson', time: '3 hours ago' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="card">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;




