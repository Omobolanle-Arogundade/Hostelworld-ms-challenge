import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { RecordItem } from '../lib/types';
import { Button } from './ui/Button';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: RecordItem | null;
  onSubmit?: (data: Partial<RecordItem>) => void;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) => {
  const [formState, setFormState] = useState<Partial<RecordItem>>({});

  useEffect(() => {
    if (initialData) {
      setFormState(initialData);
    } else {
      setFormState({});
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formState);
    setFormState({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit Record' : 'Add New Record'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            name="artist"
            placeholder="Artist"
            value={formState.artist || ''}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border p-2 rounded"
            name="album"
            placeholder="Album"
            value={formState.album || ''}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border p-2 rounded"
            name="price"
            type="number"
            placeholder="Price"
            value={formState.price || ''}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border p-2 rounded"
            name="qty"
            type="number"
            placeholder="Quantity"
            value={formState.qty || ''}
            onChange={handleChange}
            required
          />
          <select
            className="w-full border p-2 rounded"
            name="format"
            value={formState.format || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Format</option>
            <option value="Vinyl">Vinyl</option>
            <option value="CD">CD</option>
            <option value="Cassette">Cassette</option>
            <option value="Digital">Digital</option>
          </select>
          <select
            className="w-full border p-2 rounded"
            name="category"
            value={formState.category || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Rock">Rock</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Indie">Indie</option>
            <option value="Alternative">Alternative</option>
            <option value="Classical">Classical</option>
            <option value="Hip-Hop">Hip-Hop</option>
          </select>
          <input
            className="w-full border p-2 rounded"
            name="mbid"
            placeholder="MBID (optional)"
            value={formState.mbid || ''}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
