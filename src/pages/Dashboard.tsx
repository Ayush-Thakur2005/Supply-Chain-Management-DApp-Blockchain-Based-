import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogOut } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductList } from '../components/ProductList';
import { ProductDetail } from '../components/ProductDetail';
import { Product, User } from '../types';
import {
  getProducts,
  addProduct,
  updateProductStatus,
  getProductTransactions,
  processPayment,
  getUserBalance,
} from '../utils/blockchain';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    setProducts(getProducts());
  }, [navigate]);

  // Update user balance whenever it changes
  useEffect(() => {
    if (currentUser) {
      const newBalance = getUserBalance(currentUser.address);
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  }, [products]);

  const handleAddProduct = () => {
    if (!currentUser || !newProductName.trim()) return;
    
    const product = addProduct(newProductName, currentUser.address);
    setProducts(getProducts());
    setNewProductName('');
    setShowAddProduct(false);
  };

  const handleUpdateStatus = (productId: string, newStatus: 'manufactured' | 'in-transit' | 'delivered') => {
    if (!currentUser || !selectedProduct) return;
    
    const nextUser = newStatus === 'in-transit' ? 
      'distributor' : 
      newStatus === 'delivered' ? 'retailer' : currentUser.address;
    
    const updatedProduct = updateProductStatus(
      productId,
      newStatus,
      currentUser.address,
      nextUser
    );
    
    if (updatedProduct) {
      setProducts(getProducts());
      setSelectedProduct(updatedProduct);
    }
  };

  const handleProcessPayment = () => {
    if (!currentUser || !selectedProduct) return;
    
    const success = processPayment(
      selectedProduct.id,
      currentUser.address,
      selectedProduct.currentLocation
    );
    
    if (success) {
      const updatedProducts = getProducts();
      setProducts(updatedProducts);
      const updatedProduct = updatedProducts.find(p => p.id === selectedProduct.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
      // Update user balance immediately after payment
      const newBalance = getUserBalance(currentUser.address);
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const updatedProducts = getProducts();
    setProducts(updatedProducts);
    if (currentUser) {
      const newBalance = getUserBalance(currentUser.address);
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <Header
        userAddress={currentUser.address}
        userName={currentUser.name}
        userRole={currentUser.role}
      />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Products
            </h2>
            <motion.div 
              className="flex items-center mt-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-gray-600 mr-2">Balance:</span>
              <span className="text-xl font-bold text-indigo-600">
                ${currentUser.balance.toLocaleString()}
              </span>
            </motion.div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className={`p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm hover:shadow transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </motion.button>

            {currentUser.role === 'manufacturer' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddProduct(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/70 transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>

        <ProductList
          products={products}
          onProductSelect={setSelectedProduct}
        />

        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            transactions={getProductTransactions(selectedProduct.id)}
            onClose={() => setSelectedProduct(null)}
            onUpdateStatus={(newStatus) => handleUpdateStatus(selectedProduct.id, newStatus)}
            onProcessPayment={handleProcessPayment}
            userRole={currentUser.role}
          />
        )}

        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Add New Product
              </h3>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Add Product
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};