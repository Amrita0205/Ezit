import React from 'react';
import { DialogContent, DialogClose } from './dialog';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Star, X } from 'lucide-react';
import Image from 'next/image';

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

interface ProductFlashcardProps {
  product: Product;
}

const ProductFlashcard: React.FC<ProductFlashcardProps> = ({ product }) => {
  return (
    <DialogContent className="max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col items-center justify-center pt-10 pb-8 px-0" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}>
      {/* Close Button */}
      <DialogClose asChild>
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </DialogClose>
      <div className="flex flex-col w-full">
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              width={400}
              height={400}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <Image
              src="/placeholder.png"
              alt="No image"
              width={400}
              height={400}
              className="object-cover w-full h-full opacity-50"
              priority
            />
          )}
        </div>
        <CardContent className="p-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-2xl text-gray-900 truncate" title={product.title}>{product.title}</h2>
            <Badge variant={product.isActive ? 'default' : 'destructive'} className="text-xs px-3 py-1">
              {product.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-extrabold text-blue-700">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-base line-through text-gray-400">₹{product.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Star className="h-4 w-4 text-yellow-400" />
            {product.rating.average} <span className="text-xs">({product.rating.count})</span>
            <span className="ml-2">• {product.unitsSold} sold</span>
          </div>
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="text-sm text-gray-700"><span className="font-medium">Category:</span> {product.category}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Stock:</span> {product.stock}</div>
          </div>
          <div className="text-xs text-gray-400 mt-2">Added: {new Date(product.createdAt).toLocaleDateString()}</div>
        </CardContent>
      </div>
    </DialogContent>
  );
};

export default ProductFlashcard; 