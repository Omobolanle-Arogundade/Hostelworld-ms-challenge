import React from 'react';
import { Button } from './Button';

export interface RecordItem {
  _id: string;
  artist: string;
  album: string;
  price: number;
  qty: number;
  format: string;
  category: string;
}

interface RecordTableProps {
  records?: RecordItem[];
  onEdit: (record: RecordItem) => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records = [],
  onEdit,
}) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Artist
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Album
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Qty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Format
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {record.artist}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {record.album}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${record.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {record.qty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {record.format}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {record.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <Button onClick={() => onEdit(record)} size="sm">
                  Edit
                </Button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-center text-sm text-gray-400"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
