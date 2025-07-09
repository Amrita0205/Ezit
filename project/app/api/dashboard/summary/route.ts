import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getTokenFromRequest, getUserFromToken } from '@/lib/auth';

function getMonthYear(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}
function getWeekYear(date: Date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil((((date as any) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}
function getDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const userPayload = getUserFromToken(token);
    if (!userPayload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const userId = userPayload.userId;

    // Get time range from query
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'monthly';
    const now = new Date();
    let groupKeyFn: (date: Date) => string;
    let periods = 6;
    if (range === 'daily') {
      groupKeyFn = getDay;
      periods = 7;
    } else if (range === 'weekly') {
      groupKeyFn = getWeekYear;
      periods = 8;
    } else if (range === 'yearly') {
      groupKeyFn = (date) => date.getFullYear().toString();
      periods = 5;
    } else {
      groupKeyFn = getMonthYear;
      periods = 6;
    }

    // Fetch all orders and products for this seller
    const [orders, products] = await Promise.all([
      Order.find({ seller: userId }),
      Product.find({ seller: userId })
    ]);

    // Total revenue and units sold
    let totalRevenue = 0;
    let totalUnits = 0;
    let pendingOrders = 0;
    let revenueByPeriod: Record<string, number> = {};
    let unitsByPeriod: Record<string, number> = {};
    orders.forEach(order => {
      totalRevenue += order.totalAmount;
      totalUnits += order.quantity;
      if (order.status === 'pending') pendingOrders++;
      const key = groupKeyFn(order.createdAt);
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + order.totalAmount;
      unitsByPeriod[key] = (unitsByPeriod[key] || 0) + order.quantity;
    });

    // Revenue & units trend (last N periods)
    const trend = [];
    for (let i = periods - 1; i >= 0; i--) {
      let d;
      if (range === 'daily') {
        d = new Date(now);
        d.setDate(now.getDate() - i);
      } else if (range === 'weekly') {
        d = new Date(now);
        d.setDate(now.getDate() - i * 7);
      } else if (range === 'yearly') {
        d = new Date(now.getFullYear() - i, 0, 1);
      } else {
        d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      }
      const key = groupKeyFn(d);
      trend.push({
        name:
          range === 'daily'
            ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : range === 'weekly'
            ? key
            : range === 'yearly'
            ? d.getFullYear().toString()
            : d.toLocaleString('default', { month: 'short' }),
        revenue: revenueByPeriod[key] || 0,
        units: unitsByPeriod[key] || 0,
      });
    }

    // Growth calculations (compare last period to previous)
    function calcGrowth(arr: { revenue: number; units: number }[]) {
      if (arr.length < 2) return { revenueGrowth: 0, unitsGrowth: 0 };
      const last = arr[arr.length - 1];
      const prev = arr[arr.length - 2];
      const revenueGrowth = prev.revenue === 0 ? 0 : (((last.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1);
      const unitsGrowth = prev.units === 0 ? 0 : (((last.units - prev.units) / prev.units) * 100).toFixed(1);
      return { revenueGrowth, unitsGrowth };
    }
    const { revenueGrowth, unitsGrowth } = calcGrowth(trend);

    // Category performance
    const categoryPerf: Record<string, number> = {};
    products.forEach(product => {
      categoryPerf[product.category] = (categoryPerf[product.category] || 0) + (product.unitsSold || 0);
    });
    const categoryPerformance = Object.entries(categoryPerf).map(([name, value]) => ({ name, value }));

    // New products this period
    let startOfPeriod;
    if (range === 'daily') {
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'weekly') {
      const day = now.getDay();
      startOfPeriod = new Date(now);
      startOfPeriod.setDate(now.getDate() - day);
      startOfPeriod.setHours(0, 0, 0, 0);
    } else if (range === 'yearly') {
      startOfPeriod = new Date(now.getFullYear(), 0, 1);
    } else {
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const newProducts = products.filter(p => p.createdAt >= startOfPeriod).length;

    // Recent activity: last 10 orders and product updates
    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(order => ({
        type: 'order',
        id: order._id,
        orderId: order.orderId,
        status: order.status,
        amount: order.totalAmount,
        createdAt: order.createdAt,
      }));
    const recentProducts = products
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map(product => ({
        type: 'product',
        id: product._id,
        title: product.title,
        updatedAt: product.updatedAt,
      }));
    // Merge and sort by date
    const recentActivity = [...recentOrders, ...recentProducts]
      .sort((a, b) => {
        const dateA = a.createdAt || a.updatedAt;
        const dateB = b.createdAt || b.updatedAt;
        return dateB - dateA;
      })
      .slice(0, 10);

    return NextResponse.json({
      totalRevenue,
      totalUnits,
      totalProducts: products.length,
      totalOrders: orders.length,
      revenueTrend: trend,
      categoryPerformance,
      pendingOrders,
      newProducts,
      revenueGrowth,
      unitsGrowth,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 