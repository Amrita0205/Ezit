'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  TrendingUp,
  Star,
  Eye,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProductFlashcard from '@/components/ui/ProductFlashcard';
import { Checkbox } from '@/components/ui/checkbox';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  unitsSold: number;
  images: string[];
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Summer Floral Dress',
    price: 1299,
    originalPrice: 1599,
    category: 'clothing',
    stock: 15,
    unitsSold: 45,
    images: ['https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg'],
    isActive: true,
    rating: { average: 4.5, count: 23 },
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Wireless Bluetooth Headphones',
    price: 2499,
    originalPrice: 2999,
    category: 'electronics',
    stock: 8,
    unitsSold: 28,
    images: ['https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg'],
    isActive: true,
    rating: { average: 4.2, count: 17 },
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Cotton Bedsheet Set',
    price: 899,
    category: 'home',
    stock: 0,
    unitsSold: 67,
    images: ['https://images.pexels.com/photos/1267438/pexels-photo-1267438.jpeg'],
    isActive: false,
    rating: { average: 4.8, count: 34 },
    createdAt: '2024-01-05',
  },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, in, out, low
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive'>('active');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const PRODUCTS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error((await res.json()).message || 'Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data.map((product: any) => ({
          ...product,
          id: product._id,
          _id: product._id,
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Additional filters
    if (selectedFilter === 'bestsellers') {
      filtered = filtered.filter(product => product.unitsSold > 30);
    } else if (selectedFilter === 'lowstock') {
      filtered = filtered.filter(product => product.stock < 10);
    } else if (selectedFilter === 'outofstock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Advanced filters
    if (minPrice) {
      filtered = filtered.filter(product => product.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(product => product.price <= Number(maxPrice));
    }
    if (minRating) {
      filtered = filtered.filter(product => product.rating.average >= Number(minRating));
    }
    if (stockFilter === 'in') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(product => product.stock === 0);
    } else if (stockFilter === 'low') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock < 10);
    }
    if (statusFilter === 'active') {
      filtered = filtered.filter(product => product.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(product => !product.isActive);
    }

    // Sorting
    let sorted = [...filtered];
    switch (sortOption) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'ratingHigh':
        sorted.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'stockLow':
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      case 'stockHigh':
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  }, [searchTerm, selectedCategory, selectedFilter, products, minPrice, maxPrice, minRating, stockFilter, statusFilter, sortOption]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedFilter, products, minPrice, maxPrice, minRating, stockFilter, statusFilter, sortOption]);

  // Add a new analyticsFilters array for bestsellers, lowstock, outofstock
  const analyticsFilters = [
    { value: 'all', label: 'All Products' },
    { value: 'bestsellers', label: 'Best Sellers' },
    { value: 'lowstock', label: 'Low Stock' },
    { value: 'outofstock', label: 'Out of Stock' },
  ];

  const categories = [
    { value: 'clothing', label: 'Clothing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'other', label: 'Other' },
  ];

  const categoryFilters = [
    { value: 'all', label: `All Categories (${products.length})` },
    ...categories.map(cat => ({
      value: cat.value,
      label: `${cat.label} (${products.filter(p => p.category === cat.value).length})`
    })),
  ];

  // Edit modal handlers
  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setEditForm({ ...product });
  };
  const closeEditModal = () => {
    setEditProduct(null);
    setEditForm(null);
  };
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${editProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update product');
      setProducts((prev) => prev.map((p) => (p._id === editProduct._id ? { ...p, ...editForm } : p)));
      closeEditModal();
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteProductId) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${deleteProductId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete product');
      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
      setDeleteProductId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };
  const selectAllVisible = () => {
    setSelectedProductIds(filteredProducts.map(p => p.id));
  };
  const clearAllSelected = () => {
    setSelectedProductIds([]);
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedProductIds.map(id =>
        fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ));
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      setSelectedProductIds([]);
      setBulkDeleteOpen(false);
    } catch (err) {
      alert('Failed to delete selected products');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async () => {
    setBulkLoading(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedProductIds.map(id =>
        fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: bulkStatus === 'active' }),
        })
      ));
      setProducts(prev => prev.map(p =>
        selectedProductIds.includes(p.id) ? { ...p, isActive: bulkStatus === 'active' } : p
      ));
      setSelectedProductIds([]);
      setBulkStatusOpen(false);
    } catch (err) {
      alert('Failed to update status for selected products');
    } finally {
      setBulkLoading(false);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <Link href="/upload">
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                type="text"
                placeholder="Search products by name..."
                    value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-gray-300 shadow-sm"
                  />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Newest First
                  </Button>
              </div>
            </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-2">
          {categoryFilters.map(tab => (
            <Button
              key={tab.value}
              variant={selectedCategory === tab.value ? 'default' : 'outline'}
              className="rounded-full px-4 py-2 text-sm font-medium"
              onClick={() => {
                setSelectedCategory(tab.value);
                setSelectedFilter('all');
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Analytics Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {analyticsFilters.map(tab => (
            <Button
              key={tab.value}
              variant={selectedFilter === tab.value ? 'default' : 'outline'}
              className="rounded-full px-4 py-2 text-sm font-medium"
              onClick={() => {
                setSelectedFilter(tab.value);
                setSelectedCategory('all');
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="ratingHigh">Rating: High to Low</option>
            <option value="stockLow">Stock: Low to High</option>
            <option value="stockHigh">Stock: High to Low</option>
          </select>
        </div>

        {/* Product Count */}
        <div className="text-gray-600 text-sm mb-2">{filteredProducts.length} products found</div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <Input
            type="number"
            min={0}
            placeholder="Min Price"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-28"
          />
          <Input
            type="number"
            min={0}
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-28"
          />
          <Input
            type="number"
            min={0}
            max={5}
            step={0.1}
            placeholder="Min Rating"
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            className="w-28"
          />
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock (&lt; 10)</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" onClick={() => {
            setMinPrice(''); setMaxPrice(''); setMinRating(''); setStockFilter('all'); setStatusFilter('all');
          }}>Clear Filters</Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProductIds.length > 0 && (
          <div className="fixed top-20 left-0 right-0 z-50 bg-white border-b shadow flex items-center justify-between px-6 py-3">
            <div>
              <span className="font-medium">{selectedProductIds.length} selected</span>
              <Button variant="ghost" size="sm" className="ml-4" onClick={selectAllVisible}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={clearAllSelected}>Clear</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} disabled={bulkLoading}>Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setBulkStatusOpen(true)} disabled={bulkLoading}>Change Status</Button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map(product => (
            <Card key={product.id} className="rounded-2xl overflow-hidden relative group cursor-pointer" onClick={e => {
              // Prevent opening flashcard when clicking Edit/Delete
              if ((e.target as HTMLElement).closest('button')) return;
              setSelectedProduct(product);
            }}>
              <div className="absolute top-3 right-3 z-20">
                <Checkbox checked={selectedProductIds.includes(product.id)} onCheckedChange={() => toggleProductSelection(product.id)} />
              </div>
              {product.unitsSold > 30 && (
                <span className="absolute top-3 left-3 bg-yellow-400 text-xs font-semibold px-3 py-1 rounded-full z-10">Best Seller</span>
              )}
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.images && product.images[0] && product.images[0].startsWith('data:image/') ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <img
                    src="/placeholder.png"
                    alt="No image"
                    className="object-cover w-full h-full rounded-xl opacity-50"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg truncate" title={product.title}>{product.title}</h2>
                  <Badge variant={product.isActive ? 'default' : 'destructive'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                    <span className="text-sm line-through text-gray-400">₹{product.originalPrice}</span>
                    )}
                  </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  {product.rating.average} ({product.rating.count})
                  <span className="ml-2">• {product.unitsSold} sold</span>
                  </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={e => { e.stopPropagation(); openEditModal(product); }}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  <Button size="sm" variant="destructive" className="w-full" onClick={e => { e.stopPropagation(); setDeleteProductId(product.id); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}

        {/* Edit Product Modal */}
        <Dialog open={!!editProduct} onOpenChange={closeEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {editForm && (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <div>
                  <Label>Title</Label>
                  <Input value={editForm.title} onChange={e => handleEditChange('title', e.target.value)} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editForm.description} onChange={e => handleEditChange('description', e.target.value)} required />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Cost Price</Label>
                    <Input type="number" value={editForm.originalPrice} onChange={e => handleEditChange('originalPrice', Number(e.target.value))} required />
                  </div>
                  <div className="flex-1">
                    <Label>Selling Price</Label>
                    <Input type="number" value={editForm.price} onChange={e => handleEditChange('price', Number(e.target.value))} required />
                  </div>
                  <div className="flex-1">
                    <Label>Stock</Label>
                    <Input type="number" value={editForm.stock} onChange={e => handleEditChange('stock', Number(e.target.value))} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeEditModal}>Cancel</Button>
                  <Button type="submit" loading={editLoading}>Save</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteProductId(null)}>Cancel</Button>
              <Button type="button" variant="destructive" loading={deleteLoading} onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Flashcard Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={open => { if (!open) setSelectedProduct(null); }}>
          {selectedProduct && <ProductFlashcard product={selectedProduct} />}
        </Dialog>

        {/* Bulk Delete Dialog */}
        <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Selected Products</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {selectedProductIds.length} selected products? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" loading={bulkLoading} onClick={handleBulkDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Status Dialog */}
        <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Status for Selected Products</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 my-4">
              <Button variant={bulkStatus === 'active' ? 'default' : 'outline'} onClick={() => setBulkStatus('active')}>Active</Button>
              <Button variant={bulkStatus === 'inactive' ? 'default' : 'outline'} onClick={() => setBulkStatus('inactive')}>Inactive</Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkStatusOpen(false)}>Cancel</Button>
              <Button loading={bulkLoading} onClick={handleBulkStatusChange}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-center py-2 z-50 md:hidden">
          <Link href="/">
            <Button variant="ghost" className="flex flex-col items-center text-xs">
              <Package className="h-6 w-6 mb-1" />
              Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="ghost" className="flex flex-col items-center text-xs text-blue-600">
              <TrendingUp className="h-6 w-6 mb-1" />
              Products
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="ghost" className="flex flex-col items-center text-xs">
              <ShoppingCart className="h-6 w-6 mb-1" />
              Orders
            </Button>
          </Link>
            <Link href="/upload">
            <Button variant="ghost" className="flex flex-col items-center text-xs">
              <Plus className="h-6 w-6 mb-1" />
              Upload
            </Button>
          </Link>
          <Link href="/content">
            <Button variant="ghost" className="flex flex-col items-center text-xs">
              <Star className="h-6 w-6 mb-1" />
              Content
              </Button>
            </Link>
        </nav>
      </div>
    </DashboardLayout>
  );
}