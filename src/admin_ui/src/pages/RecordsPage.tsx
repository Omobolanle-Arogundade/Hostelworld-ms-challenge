import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { RecordFormModal } from '../components/RecordFormModal';
import { RecordTable } from '../components/RecordTable';
import type { RecordItem } from '../lib/types';
import { MostOrderedSidebar } from '../components/MostOrderedSidebar';
import { fetchRecords, createRecord, updateRecord } from '../lib/api';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      try {
        const { data } = await fetchRecords();
        setRecords(data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load records',
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleEditRecord = (record: RecordItem) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: Partial<RecordItem>) => {
    try {
      if (selectedRecord) {
        const updated = await updateRecord(selectedRecord._id, data);
        setRecords((prev) =>
          prev.map((rec) => (rec._id === updated._id ? updated : rec)),
        );
        toast.success('Record updated successfully');
      } else {
        const created = await createRecord(data);
        setRecords((prev) => [...prev, created]);
        toast.success('Record created successfully');
      }
      setShowModal(false);
      setSelectedRecord(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen p-4 gap-4 bg-gray-50">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Records</h1>
          <Button onClick={handleAddRecord}>Add Record</Button>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-10">
            Loading records...
          </div>
        ) : (
          <RecordTable records={records} onEdit={handleEditRecord} />
        )}
      </div>

      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
        <MostOrderedSidebar />
      </div>

      <RecordFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedRecord}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default RecordsPage;
