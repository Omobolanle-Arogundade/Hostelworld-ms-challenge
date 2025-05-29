import React from 'react';
import type { MostOrderedRecord } from '../lib/types';

export const MostOrderedSidebar: React.FC<{
  mostOrderedRecords: MostOrderedRecord[];
}> = ({ mostOrderedRecords }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Most Ordered Records</h2>
      <ul className="space-y-3">
        {mostOrderedRecords.length ? (
          mostOrderedRecords.map((record) => (
            <li
              key={record.recordId}
              className="p-3 rounded-md border bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="font-medium text-sm">
                {record.artist} - <span className="italic">{record.album}</span>
              </div>
              <div className="text-xs text-gray-500">
                {record.totalOrdered} orders
              </div>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500">No records ordered yet.</li>
        )}
      </ul>
    </div>
  );
};
