import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DemographicItem {
  label: string;
  value: number | string;
}

interface DemographicsProps {
  demographics?: {
    age?: DemographicItem[];
    gender?: DemographicItem[];
    locations?: DemographicItem[];
  };
}

const Demographics: React.FC<DemographicsProps> = ({ demographics }) => (
  <div className="bg-white rounded shadow p-4 mb-6">
    <div className="font-semibold mb-2">Audience Demographics</div>
    <div className="mb-2">
      <div className="font-medium mb-1">Age Distribution</div>
      <div className="flex flex-wrap gap-2">
        {demographics?.age && demographics.age.length > 0 ? (
          demographics.age.map((a) => (
            <Badge key={a.label} className="bg-blue-100 text-blue-800">{a.label}: {a.value}%</Badge>
          ))
        ) : (
          <div className="text-gray-400">No age data available.</div>
        )}
      </div>
    </div>
    <div className="mb-2">
      <div className="font-medium mb-1">Gender Distribution</div>
      <div className="flex flex-wrap gap-2">
        {demographics?.gender && demographics.gender.length > 0 ? (
          demographics.gender.map((g) => (
            <Badge key={g.label} className="bg-pink-100 text-pink-800">{g.label}: {g.value}%</Badge>
          ))
        ) : (
          <div className="text-gray-400">No gender data available.</div>
        )}
      </div>
    </div>
    <div>
      <div className="font-medium mb-1">Top Locations</div>
      <div className="flex flex-wrap gap-2">
        {demographics?.locations && demographics.locations.length > 0 ? (
          demographics.locations.map((l) => (
            <Badge key={l.label} className="bg-green-100 text-green-800">{l.label}: {l.value}</Badge>
          ))
        ) : (
          <div className="text-gray-400">No location data available.</div>
        )}
      </div>
    </div>
  </div>
);

export default Demographics; 