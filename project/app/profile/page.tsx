'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Store, 
  Upload, 
  Check,
  Clock,
  AlertCircle,
  Instagram,
  Youtube,
  Facebook,
  CreditCard,
  FileText,
  Camera,
  Edit,
  Save,
  MapPin,
  Phone,
  Mail,
  Globe,
  Twitter,
} from 'lucide-react';

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Basic Info',
    description: 'Complete your profile information',
    icon: User,
    fields: ['name', 'email', 'phone', 'city'],
  },
  {
    id: 2,
    title: 'ID Verification',
    description: 'Upload your identity documents',
    icon: FileText,
    fields: ['aadhar', 'pan', 'gst'],
  },
  {
    id: 3,
    title: 'Social Links',
    description: 'Add your social media profiles',
    icon: Globe,
    fields: ['instagram', 'youtube', 'facebook', 'twitter'],
  },
  {
    id: 4,
    title: 'Store Setup',
    description: 'Set up your store details',
    icon: Store,
    fields: ['storeName', 'storeDescription', 'bankDetails'],
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const userSocialLinks: SocialLinks = user?.socialLinks || {};
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: user?.city || '',
    storeName: user?.storeName || '',
    storeDescription: '',
    socialLinks: {
      instagram: userSocialLinks.instagram || '',
      youtube: userSocialLinks.youtube || '',
      facebook: userSocialLinks.facebook || '',
      twitter: userSocialLinks.twitter || '',
    },
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      accountHolder: '',
    },
  });

  const currentStep = user?.onboardingStep || 1;
  const completedSteps = currentStep - 1;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [documentUrls, setDocumentUrls] = useState<{ [key: string]: string }>({
    aadhar: user?.documents?.aadhar || '',
    pan: user?.documents?.pan || '',
    gst: user?.documents?.gst || '',
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update profile');
      const data = await res.json();
      updateUser(data.user);
      setEditMode(false);
      // Optionally show a toast or success message here
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(prev => ({ ...prev, [type]: true }));
        try {
          // Convert file to base64
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile/documents', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ file: base64, type }),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Failed to upload document');
            const data = await res.json();
            setDocumentUrls(prev => ({ ...prev, [type]: data.url }));
            // Optionally show a toast or success message here
          };
          reader.readAsDataURL(file);
        } catch (error) {
          alert('Failed to upload document');
        } finally {
          setUploading(prev => ({ ...prev, [type]: false }));
        }
      }
    };
    input.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your profile and store settings
            </p>
          </div>
          <Button 
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? 'outline' : 'default'}
          >
            {editMode ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Onboarding Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Onboarding Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Step {currentStep} of {onboardingSteps.length}
                </span>
                <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
                  {progressPercentage === 100 ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {onboardingSteps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = step.id <= completedSteps;
                  const isCurrent = step.id === currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isCurrent 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{step.title}</h3>
                        <p className="text-xs text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleFileUpload('profile')}
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border"
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                    className="mt-1"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  disabled={!editMode}
                  className="mt-1"
                  placeholder="Your Store Name"
                />
              </div>
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={formData.storeDescription}
                  onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                  disabled={!editMode}
                  className="mt-1"
                  placeholder="Describe your store..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Store Statistics</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Products</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Followers</p>
                    <p className="text-2xl font-bold">{user?.followers || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <Input
                    id="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                    disabled={!editMode}
                    placeholder="@username"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <Input
                    id="youtube"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                    disabled={!editMode}
                    placeholder="Channel URL"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <Input
                    id="facebook"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                    disabled={!editMode}
                    placeholder="Page URL"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                    disabled={!editMode}
                    placeholder="Profile URL"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Aadhar Card</p>
                      <p className="text-sm text-gray-600">Identity verification</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload('aadhar')}
                    disabled={!editMode}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">PAN Card</p>
                      <p className="text-sm text-gray-600">Tax identification</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload('pan')}
                    disabled={!editMode}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">GST Certificate</p>
                      <p className="text-sm text-gray-600">Business registration</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileUpload('gst')}
                    disabled={!editMode}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                  disabled={!editMode}
                  className="mt-1"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input
                  id="ifsc"
                  value={formData.bankDetails.ifsc}
                  onChange={(e) => handleInputChange('bankDetails.ifsc', e.target.value)}
                  disabled={!editMode}
                  className="mt-1"
                  placeholder="ABCD0123456"
                />
              </div>
              <div>
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={formData.bankDetails.accountHolder}
                  onChange={(e) => handleInputChange('bankDetails.accountHolder', e.target.value)}
                  disabled={!editMode}
                  className="mt-1"
                  placeholder="Full Name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {editMode && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}