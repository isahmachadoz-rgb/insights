export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  product: string;
  quantity: number;
  price: number;
  transactionId: string;
  category?: string;
  region?: string;
}

export interface SalesData {
  fileName: string;
  data: Sale[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface SalesMetrics {
  totalSales: number;
  averageTicket: number;
  bestMonth: string;
  bestSellingProduct: string;
  analyzedPeriods: string[];
  highestRevenueCategory: string;
  mostProfitableRegion: string;
  monthOverMonthChange: number;
  salesByMonth: { [key: string]: number };
  salesByProduct: { [key: string]: number };
  salesByCategory: { [key: string]: number };
  salesByRegion: { [key: string]: number };
}