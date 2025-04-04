import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, DollarSign } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'manufactured':
        return <Package className="text-indigo-500" size={24} />;
      case 'in-transit':
        return <Truck className="text-amber-500" size={24} />;
      case 'delivered':
        return <CheckCircle className="text-emerald-500" size={24} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-indigo-100 text-indigo-700';
      case 'in-transit':
        return 'bg-amber-100 text-amber-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={product.id}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 overflow-hidden"
          onClick={() => onProductSelect(product)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              {getStatusIcon(product.status)}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">{product.currentLocation}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium px-3 py-1 rounded-full text-sm ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-lg text-indigo-600 flex items-center">
                  <DollarSign size={18} />
                  {product.price.toLocaleString()}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="font-mono text-xs text-gray-500 truncate">
                  TX: {product.transactionHash}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`h-2 ${
            product.paymentStatus === 'completed' ? 'bg-emerald-500' :
            product.paymentStatus === 'processing' ? 'bg-amber-500' :
            'bg-gray-200'
          }`} />
        </motion.div>
      ))}
    </div>
  );
};