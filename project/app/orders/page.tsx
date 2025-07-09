'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Package, 
  Truck, 
  Clock, 
  X, 
  Eye,
  Edit,
  Download,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Order {
  id: string;
  orderId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  trackingNumber?: string;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-800', icon: Package },
  cancelled: { color: 'bg-red-100 text-red-800', icon: X },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch orders');
        }
        const data = await res.json();
        // Map backend data to UI format if needed
        setOrders(data.map((order: any) => ({
          id: order._id,
          orderId: order.orderId,
          productTitle: order.product?.title || 'Product',
          productImage: order.product?.images?.[0] || '',
          quantity: order.quantity,
          price: order.price,
          totalAmount: order.totalAmount,
          status: order.status,
          customerName: order.customerInfo?.name || '',
          customerPhone: order.customerInfo?.phone || '',
          customerAddress: order.customerInfo?.address || '',
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          trackingNumber: order.trackingNumber,
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterOrders(term, selectedStatus);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    filterOrders(searchTerm, status);
  };

  const filterOrders = (search: string, status: string) => {
    let filtered = orders;

    if (search) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.productTitle.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(order => order.status === status);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setStatusUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update order');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setFilteredOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.color} font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer orders
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={selectedStatus === 'shipped' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('shipped')}
                >
                  Shipped
                </Button>
                <Button
                  variant={selectedStatus === 'delivered' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('delivered')}
                >
                  Delivered
                </Button>
                <Button
                  variant={selectedStatus === 'cancelled' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('cancelled')}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{order.productTitle}</h3>
                      <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer</p>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Order Details</p>
                      <p className="font-medium">Qty: {order.quantity}</p>
                      <p className="text-sm text-gray-600">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.status}
                          onValueChange={value => handleStatusChange(order.id, value as Order['status'])}
                          disabled={statusUpdatingId === order.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline">
                          {order.paymentMethod.toUpperCase()}
                        </Badge>
                      </div>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-600 mt-1">
                          Track: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}