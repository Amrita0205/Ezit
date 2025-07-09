'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Home,
  Package,
  ShoppingCart,
  Upload,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Store,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Products', href: '/products' },
  { icon: ShoppingCart, label: 'Orders', href: '/orders' },
  { icon: Upload, label: 'Upload', href: '/upload' },
  { icon: FileText, label: 'Content', href: '/content' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    // Optionally, show a toast here
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 pb-24">
          <div className="flex items-center space-x-2 mb-8">
            <Store className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ezit</h1>
          </div>

          {user && (
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.city}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">{user.followers} followers</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-red-100 transition-colors text-gray-700 hover:text-red-600 shadow-lg"
                    aria-label="Logout"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white text-gray-900 px-3 py-2 rounded shadow">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}