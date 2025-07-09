'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  Camera, 
  Package,
  DollarSign,
  Truck,
  CheckCircle,
} from 'lucide-react';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory: string;
  size: string;
  material: string;
  stock: number;
  images: File[];
  colors: string[];
  tags: string[];
  isCOD: boolean;
  isReturnable: boolean;
  deliveryTime: string;
  shippingCost: number;
}

const categories = [
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Kitchen' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'books', label: 'Books' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'other', label: 'Other' },
];

const CLOUDINARY_UPLOAD_PRESET = 'ezit_unsigned';
const CLOUDINARY_CLOUD_NAME = 'dvkqtaqtt';

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    subcategory: '',
    size: '',
    material: '',
    stock: 0,
    images: [],
    colors: [],
    tags: [],
    isCOD: false,
    isReturnable: false,
    deliveryTime: '3-5 days',
    shippingCost: 0,
  });

  const steps = [
    { id: 1, title: 'Product Details', icon: Package },
    { id: 2, title: 'Media Upload', icon: Camera },
    { id: 3, title: 'Pricing', icon: DollarSign },
    { id: 4, title: 'Delivery', icon: Truck },
  ];

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5), // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (formData.images.length === 0) {
      setError('Please upload at least one product image.');
      setLoading(false);
      return;
    }

    try {
      // Convert images to base64
      const imageBase64s = await Promise.all(
        formData.images.map(fileToBase64)
      );

      // Submit product data
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          images: imageBase64s, // Save base64 strings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/products');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.images.length > 0;
      case 3:
        return formData.price > 0 && formData.stock > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Created!</h2>
              <p className="text-gray-600 mb-4">
                Your product has been successfully uploaded and is now available in your inventory.
              </p>
              <Button onClick={() => router.push('/products')}>
                View Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Product</h1>
          <p className="text-gray-600 mt-1">
            Add a new product to your inventory
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-2">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imageUploadLoading && (
          <Alert variant="info">
            <AlertDescription>Uploading images, please wait...</AlertDescription>
          </Alert>
        )}
        {imageUploadError && (
          <Alert variant="destructive">
            <AlertDescription>{imageUploadError}</AlertDescription>
          </Alert>
        )}

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Product Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Only show size for clothing and sports categories */}
                  {['clothing', 'sports'].includes(formData.category) && (
                    <div>
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        placeholder="e.g., M, L, XL"
                      />
                    </div>
                  )}
                </div>
                {/* Only show material for relevant categories */}
                {['clothing', 'home', 'beauty', 'sports'].includes(formData.category) && (
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      placeholder="e.g., Cotton, Silk, Leather"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Media Upload */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Product Images</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB (Max 5 images)</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="mt-2"
                    >
                      Choose Images
                    </Button>
                  </div>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Selling Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                      placeholder="0 (optional)"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Delivery */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cod"
                    checked={formData.isCOD}
                    onCheckedChange={(checked) => handleInputChange('isCOD', checked)}
                  />
                  <Label htmlFor="cod">Cash on Delivery (COD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="returnable"
                    checked={formData.isReturnable}
                    onCheckedChange={(checked) => handleInputChange('isReturnable', checked)}
                  />
                  <Label htmlFor="returnable">Returnable</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryTime">Delivery Time</Label>
                    <Select value={formData.deliveryTime} onValueChange={(value) => handleInputChange('deliveryTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 days">1-2 days</SelectItem>
                        <SelectItem value="3-5 days">3-5 days</SelectItem>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2 weeks">2 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shippingCost">Shipping Cost (₹)</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      value={formData.shippingCost}
                      onChange={(e) => handleInputChange('shippingCost', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!canProceed() || loading}
              >
                {loading ? 'Uploading...' : currentStep === 4 ? 'Upload Product' : 'Next'}
                {currentStep < 4 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}