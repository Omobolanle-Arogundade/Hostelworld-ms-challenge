export interface MostOrderedRecord {
  _id: string;
  artist: string;
  album: string;
  orderCount: number;
}

export interface RecordItem {
  _id: string;
  artist: string;
  album: string;
  price: number;
  qty: number;
  format: string;
  category: string;
  mbid?: string;
  tracklist?: string[];
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  user: UserInfo;
  access_token: string;
}
export interface RecordTableProps {
  records?: RecordItem[];
  onEdit: (record: RecordItem) => void;
  userRole: UserRole;
  onOrder: (record: RecordItem) => void;
}

export type UserRole = 'admin' | 'user' | null;

export interface PaginatedResponse<T> {
  data: T[];

  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: { _id: string; album: string };
  onSubmit: (quantity: number) => void;
}

export interface Order {
  _id: string;
  recordId: string;
  userId: string;
  quantity: number;
}
