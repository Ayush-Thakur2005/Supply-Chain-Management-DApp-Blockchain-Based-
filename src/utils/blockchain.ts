import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Block, Transaction, User, Product, MarketAnalysis } from '../types';
import { ethers } from 'ethers';
import SupplyChainABI from '../contracts/SupplyChain.json';

// Mock blockchain for demo purposes
let blockchain: Block[] = [];
let currentTransactions: Transaction[] = [];
let products: Product[] = [];
let users: User[] = [];

// Initialize demo users with higher balances
const initializeDemoUsers = () => {
  const roles: ('manufacturer' | 'distributor' | 'retailer')[] = ['manufacturer', 'distributor', 'retailer'];
  roles.forEach(role => {
    users.push({
      address: ethers.Wallet.createRandom().address,
      role,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      balance: 1000000, // Starting with $1M for demo purposes
      tradingVolume: 0,
      reputation: 85 + Math.random() * 15,
      certifications: ['ISO 9001', 'Supply Chain Security']
    });
  });
};

// Initialize users if not already done
if (users.length === 0) {
  initializeDemoUsers();
}

const generatePriceHistory = (basePrice: number, days: number = 30) => {
  const history = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 0.05; // -2.5% to +2.5% change
    currentPrice = currentPrice * (1 + change);
    
    history.push({
      timestamp,
      price: Math.round(currentPrice)
    });
  }
  
  return history;
};

const generateMarketAnalysis = (priceHistory: Array<{ price: number }>): MarketAnalysis => {
  const prices = priceHistory.map(h => h.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const volatility = Math.sqrt(prices.reduce((a, b) => a + Math.pow(b - avgPrice, 2), 0) / prices.length) / avgPrice;
  
  const recentPrices = prices.slice(-5);
  const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'bullish' : 
                recentPrices[recentPrices.length - 1] < recentPrices[0] ? 'bearish' : 'neutral';
  
  return {
    volatility: parseFloat((volatility * 100).toFixed(2)),
    trend,
    volume: faker.number.int({ min: 100000, max: 1000000 }),
    predictions: {
      shortTerm: avgPrice * (1 + (Math.random() - 0.5) * 0.1),
      mediumTerm: avgPrice * (1 + (Math.random() - 0.5) * 0.2),
      longTerm: avgPrice * (1 + (Math.random() - 0.5) * 0.3)
    }
  };
};

// Helper functions
const createHash = (data: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
};

const generateRandomCoordinates = () => ({
  lat: faker.location.latitude({ min: 25, max: 45 }),
  lng: faker.location.longitude({ min: -120, max: -70 })
});

const generateRoute = (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
  const points = [];
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    points.push({
      lat: start.lat + (end.lat - start.lat) * (i / steps),
      lng: start.lng + (end.lng - start.lng) * (i / steps)
    });
  }
  return points;
};

// Create new block
const createBlock = (): Block => {
  const previousBlock = blockchain[blockchain.length - 1];
  const block: Block = {
    hash: '',
    previousHash: previousBlock ? previousBlock.hash : '0x0',
    timestamp: Date.now(),
    transactions: [...currentTransactions],
    nonce: Math.floor(Math.random() * 1000000)
  };
  
  block.hash = createHash(
    block.previousHash + 
    block.timestamp.toString() + 
    JSON.stringify(block.transactions) + 
    block.nonce.toString()
  );
  
  blockchain.push(block);
  currentTransactions = [];
  return block;
};

// Add new transaction
export const createTransaction = (
  from: string,
  to: string,
  productId: string,
  action: string,
  amount?: number,
  margin?: number,
  quantity?: number
): Transaction => {
  const transaction: Transaction = {
    hash: createHash(Date.now().toString() + from + to + productId),
    from,
    to,
    productId,
    action,
    timestamp: Date.now(),
    amount,
    paymentStatus: amount ? 'pending' : undefined,
    margin,
    quantity
  };
  
  currentTransactions.push(transaction);
  return transaction;
};

// Add new product
export const addProduct = (name: string, manufacturer: string): Product => {
  const startLocation = generateRandomCoordinates();
  const endLocation = generateRandomCoordinates();
  const price = faker.number.int({ min: 10000, max: 100000 });
  const priceHistory = generatePriceHistory(price);
  
  const product: Product = {
    id: uuidv4(),
    name,
    manufacturer,
    currentLocation: manufacturer,
    status: 'manufactured',
    timestamp: Date.now(),
    transactionHash: createHash(Date.now().toString() + name + manufacturer),
    price,
    paymentStatus: 'pending',
    estimatedDelivery: Date.now() + (7 * 24 * 60 * 60 * 1000),
    coordinates: startLocation,
    route: generateRoute(startLocation, endLocation),
    quality: 100,
    temperature: faker.number.int({ min: 18, max: 24 }),
    humidity: faker.number.int({ min: 40, max: 60 }),
    inspectionStatus: 'pending',
    retailPrice: price * 1.2,
    priceHistory,
    marketAnalysis: generateMarketAnalysis(priceHistory),
    distributorMargin: 15, // 15% margin
    batchSize: faker.number.int({ min: 100, max: 1000 }),
    minimumOrderQuantity: faker.number.int({ min: 10, max: 50 }),
    certifications: ['ISO 9001', 'GMP', 'HACCP'],
    sustainabilityScore: faker.number.int({ min: 60, max: 100 })
  };
  
  products.push(product);
  createTransaction(manufacturer, manufacturer, product.id, 'Product Created');
  createBlock();
  
  return product;
};

// Update product status
export const updateProductStatus = (
  productId: string,
  newStatus: 'manufactured' | 'in-transit' | 'delivered',
  from: string,
  to: string
): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  product.status = newStatus;
  product.currentLocation = to;
  product.timestamp = Date.now();
  
  if (newStatus === 'in-transit') {
    product.paymentStatus = 'processing';
    const nextPoint = product.route[Math.floor(product.route.length / 2)];
    product.coordinates = nextPoint;
    product.quality = Math.max(80, product.quality - faker.number.int({ min: 1, max: 5 }));
    
    // Update market analysis
    product.marketAnalysis = generateMarketAnalysis(product.priceHistory);
  } else if (newStatus === 'delivered') {
    product.paymentStatus = 'completed';
    product.coordinates = product.route[product.route.length - 1];
    product.quality = Math.max(70, product.quality - faker.number.int({ min: 1, max: 10 }));
    
    // Update trading volume for users
    const fromUser = users.find(u => u.address === from);
    const toUser = users.find(u => u.address === to);
    if (fromUser) fromUser.tradingVolume = (fromUser.tradingVolume || 0) + product.price;
    if (toUser) toUser.tradingVolume = (toUser.tradingVolume || 0) + product.price;
  }
  
  // Update environmental conditions
  product.temperature = faker.number.int({ min: 18, max: 24 });
  product.humidity = faker.number.int({ min: 40, max: 60 });
  
  // Add new price point to history
  const newPrice = product.price * (1 + (Math.random() - 0.5) * 0.05);
  product.priceHistory.push({
    timestamp: Date.now(),
    price: Math.round(newPrice)
  });
  
  createTransaction(from, to, productId, `Status Updated to ${newStatus}`);
  createBlock();
  
  return product;
};

// Process payment
export const processPayment = (
  productId: string,
  from: string,
  to: string
): boolean => {
  const product = products.find(p => p.id === productId);
  if (!product) return false;
  
  const fromUser = users.find(u => u.address === from);
  const toUser = users.find(u => u.address === product.manufacturer);
  
  if (!fromUser || !toUser || fromUser.balance < product.price) return false;
  
  // Update balances
  fromUser.balance -= product.price;
  toUser.balance += product.price;
  
  // Update product status
  product.paymentStatus = 'completed';
  
  // Update trading volume and reputation
  fromUser.tradingVolume = (fromUser.tradingVolume || 0) + product.price;
  toUser.tradingVolume = (toUser.tradingVolume || 0) + product.price;
  
  // Adjust reputation based on transaction
  fromUser.reputation = Math.min(100, (fromUser.reputation || 85) + 0.5);
  toUser.reputation = Math.min(100, (toUser.reputation || 85) + 0.5);
  
  createTransaction(from, to, productId, 'Payment Processed', product.price);
  createBlock();
  
  return true;
};

// Set distributor margin
export const setDistributorMargin = (productId: string, margin: number): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  product.distributorMargin = margin;
  product.retailPrice = product.price * (1 + margin / 100);
  
  createTransaction(
    product.currentLocation,
    product.currentLocation,
    productId,
    'Distributor Margin Updated',
    undefined,
    margin
  );
  
  createBlock();
  return product;
};

// Update batch size
export const updateBatchSize = (productId: string, newSize: number): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  product.batchSize = newSize;
  createTransaction(
    product.currentLocation,
    product.currentLocation,
    productId,
    'Batch Size Updated',
    undefined,
    undefined,
    newSize
  );
  
  createBlock();
  return product;
};

// Get market analysis
export const getMarketAnalysis = (productId: string): MarketAnalysis | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  return product.marketAnalysis;
};

// Inspect product
export const inspectProduct = (productId: string, inspector: string): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  product.inspectionStatus = product.quality >= 90 ? 'passed' : 'failed';
  createTransaction(inspector, product.currentLocation, productId, `Inspection ${product.inspectionStatus}`);
  createBlock();
  
  return product;
};

// Update retail price
export const updateRetailPrice = (productId: string, newPrice: number): Product | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  product.retailPrice = newPrice;
  createTransaction(product.currentLocation, product.currentLocation, productId, 'Retail Price Updated');
  createBlock();
  
  return product;
};

// Get all products
export const getProducts = (): Product[] => products;

// Get all transactions for a product
export const getProductTransactions = (productId: string): Transaction[] => {
  return blockchain.flatMap(block => 
    block.transactions.filter(tx => tx.productId === productId)
  );
};

// Get user by address
export const getUser = (address: string): User | undefined => {
  return users.find(u => u.address === address);
};

// Authenticate user
export const authenticateUser = (credentials: { role: string; password: string }): User | null => {
  const passwords = {
    manufacturer: 'mfg123',
    distributor: 'dist123',
    retailer: 'ret123'
  };
  
  if (passwords[credentials.role as keyof typeof passwords] !== credentials.password) {
    return null;
  }
  
  const user = users.find(u => u.role === credentials.role);
  return user || null;
};

// Get user balance
export const getUserBalance = (address: string): number => {
  const user = users.find(u => u.address === address);
  return user?.balance || 0;
};

// Get user trading volume
export const getUserTradingVolume = (address: string): number => {
  const user = users.find(u => u.address === address);
  return user?.tradingVolume || 0;
};

// Get user reputation
export const getUserReputation = (address: string): number => {
  const user = users.find(u => u.address === address);
  return user?.reputation || 85;
};