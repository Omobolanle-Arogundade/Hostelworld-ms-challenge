import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/Button';
import type { OrderModalProps } from '../lib/types';

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  record,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1) return;
    onSubmit(quantity);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold">
          Order: <span className="text-blue-600">{record.album}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Quantity:
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border rounded"
              required
            />
          </label>

          <div className="flex justify-end space-x-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm Order</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
