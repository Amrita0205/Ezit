'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('monthly');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/dashboard/summary?range=${timeRange}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [timeRange]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <span className="text-lg text-gray-500">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback if stats not loaded
  if (!stats) return null;

  // Calculate growth (now from API)
  const revenueGrowth = stats.revenueGrowth;
  const unitsGrowth = stats.unitsGrowth;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.city} • {user?.followers} followers
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('daily')}
            >
              Daily
            </Button>
            <Button
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={timeRange === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue?.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{revenueGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnits}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{unitsGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <div className="flex items-center text-xs text-blue-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.newProducts} new this month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-xs text-orange-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.pendingOrders} pending
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Revenue & Units Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="units" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity (now dynamic) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length === 0 && (
                <div className="text-gray-500 text-center">No recent activity.</div>
              )}
              {stats.recentActivity && stats.recentActivity.map((activity: any, idx: number) => (
                <div key={activity.id + idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    {activity.type === 'order' ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <div>
                      {activity.type === 'order' ? (
                        <>
                          <p className="font-medium">New order received</p>
                          <p className="text-sm text-gray-600">Order #{activity.orderId} - ₹{activity.amount}</p>
                          <p className="text-xs text-gray-400">Status: {activity.status}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">Product updated</p>
                          <p className="text-sm text-gray-600">{activity.title}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.type === 'order' ? 'secondary' : 'outline'}>
                      {activity.type === 'order' ? 'Order' : 'Product'}
                    </Badge>
                    <p className="text-sm text-gray-600">{new Date(activity.createdAt || activity.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}