import React from 'react';
import type { MostOrderedRecord } from '../lib/types';

const mockMostOrdered: MostOrderedRecord[] = [
  { _id: '1', artist: 'The Beatles', album: 'Abbey Road', orderCount: 45 },
  { _id: '2', artist: 'Kendrick Lamar', album: 'DAMN.', orderCount: 38 },
  { _id: '3', artist: 'Adele', album: '21', orderCount: 30 },
];

export const MostOrderedSidebar: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Most Ordered Records</h2>
      <ul className="space-y-3">
        {mockMostOrdered.map((record) => (
          <li
            key={record._id}
            className="p-3 rounded-md border bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="font-medium text-sm">
              {record.artist} - <span className="italic">{record.album}</span>
            </div>
            <div className="text-xs text-gray-500">
              {record.orderCount} orders
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
