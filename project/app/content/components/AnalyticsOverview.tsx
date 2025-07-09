import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, Users, TrendingUp } from 'lucide-react';

interface AnalyticsItem {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  color: string;
}

interface AnalyticsOverviewProps {
  analyticsData: AnalyticsItem[];
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Eye': return <Eye className="h-6 w-6" />;
    case 'Heart': return <Heart className="h-6 w-6" />;
    case 'Users': return <Users className="h-6 w-6" />;
    case 'TrendingUp': return <TrendingUp className="h-6 w-6" />;
    default: return <Eye className="h-6 w-6" />;
  }
};

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ analyticsData }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {analyticsData.map((item) => (
      <Card key={item.title} className="p-4">
        <CardContent className="p-0">
          <div className="flex flex-col items-start">
            <div className={`mb-2 text-${item.color === 'primary' ? 'blue' : item.color === 'secondary' ? 'purple' : item.color === 'success' ? 'green' : 'yellow'}-600`}>
              {getIcon(item.icon)}
            </div>
            <div className="text-lg font-semibold">{item.value}</div>
            <div className="text-gray-500 text-sm mb-1">{item.title}</div>
            <div className={item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>{item.change}</div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default AnalyticsOverview; 