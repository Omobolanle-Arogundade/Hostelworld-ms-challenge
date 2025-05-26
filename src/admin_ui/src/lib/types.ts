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

export interface RecordTableProps {
  records?: RecordItem[];
  onEdit: (record: RecordItem) => void;
}
