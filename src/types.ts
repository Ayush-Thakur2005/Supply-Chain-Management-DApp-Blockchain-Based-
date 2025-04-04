export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  currentLocation: string;
  status: 'manufactured' | 'in-transit' | 'delivered';
  timestamp: number;
  transactionHash: string;
  price: number;
  paymentStatus: 'pending' | 'processing' | 'completed';
  estimatedDelivery: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  route: Array<{
    lat: number;
    lng: number;
  }>;
  quality: number;
  temperature: number;
  humidity: number;
  inspectionStatus: 'pending' | 'passed' | 'failed';
  retailPrice: number;
  priceHistory: Array<{
    timestamp: number;
    price: number;
  }>;
  marketAnalysis: {
    volatility: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    volume: number;
  };
  distributorMargin: number;
  batchSize: number;
  minimumOrderQuantity: number;
  certifications: string[];
  sustainabilityScore: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  productId: string;
  action: string;
  timestamp: number;
  amount?: number;
  paymentStatus?: 'pending' | 'processing' | 'completed';
  margin?: number;
  quantity?: number;
}

export interface Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
}

export interface User {
  address: string;
  role: 'manufacturer' | 'distributor' | 'retailer';
  name: string;
  balance: number;
  tradingVolume?: number;
  reputation?: number;
  certifications?: string[];
}

export interface LoginCredentials {
  role: 'manufacturer' | 'distributor' | 'retailer';
  password: string;
}

export interface MarketAnalysis {
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volume: number;
  predictions: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
}