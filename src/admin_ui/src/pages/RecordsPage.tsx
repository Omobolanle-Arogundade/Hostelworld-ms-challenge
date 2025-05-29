import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { RecordFormModal } from '../components/RecordFormModal';
import { RecordTable } from '../components/RecordTable';
import { LoginModal } from '../components/LoginModal';
import type {
  MostOrderedRecord,
  RecordItem,
  UserInfo,
  UserRole,
} from '../lib/types';
import { MostOrderedSidebar } from '../components/MostOrderedSidebar';
import {
  fetchRecords,
  createRecord,
  updateRecord,
  getUser,
  createOrder,
  fetchMostOrderedRecords,
} from '../lib/api';
import { OrderModal } from '../components/OrderModal';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mostOrdered, setMostOrdered] = useState<MostOrderedRecord[]>([]);

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

  const loadMostOrdered = async () => {
    try {
      const mostOrderedData = await fetchMostOrderedRecords();
      setMostOrdered(mostOrderedData);
    } catch (error) {
      console.error('Failed to fetch most ordered records:', error);
      setMostOrdered([]);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getUser();
        if (user) {
          return setUser(user);
        }
        setUser(null);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      }
    };

    checkUser();
    loadRecords();
    loadMostOrdered();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setShowRecordModal(true);
  };

  const handleLogin = () => {
    setUser(null);
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const handleEditRecord = (record: RecordItem) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const handleOrder = (record: RecordItem) => {
    setSelectedRecord(record);
    setShowOrderModal(true);
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
      setShowRecordModal(false);
      setSelectedRecord(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleOrderSubmit = async (quantity: number) => {
    if (!selectedRecord) return;
    try {
      await createOrder(selectedRecord._id, quantity);
      toast.success(
        `Order placed successfully for ${quantity} copies of ${selectedRecord.album}`,
      );

      loadRecords();
      loadMostOrdered();
      setShowOrderModal(false);
      setSelectedRecord(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen p-4 gap-4 bg-gray-50">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Broken Record Store</h1>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleAddRecord}
                >
                  Create Record
                </Button>
              )}
              <Button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-10">
            Loading records...
          </div>
        ) : (
          <RecordTable
            records={records}
            userRole={user?.role as UserRole}
            onEdit={handleEditRecord}
            onOrder={handleOrder}
          />
        )}
      </div>

      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
        <MostOrderedSidebar mostOrderedRecords={mostOrdered} />
      </div>

      <RecordFormModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        initialData={selectedRecord}
        onSubmit={handleFormSubmit}
      />

      <LoginModal
        isOpen={showLoginModal}
        onLoginSuccess={(user: UserInfo) => setUser(user)}
        onClose={() => setShowLoginModal(false)}
      />

      {selectedRecord && (
        <OrderModal
          isOpen={showOrderModal}
          record={selectedRecord}
          onClose={() => setShowOrderModal(false)}
          onSubmit={handleOrderSubmit}
        />
      )}
    </div>
  );
};

export default RecordsPage;
