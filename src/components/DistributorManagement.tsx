import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { 
  TrendingUp, PackageSearch, Truck, BarChart3, 
  DollarSign, AlertTriangle, CheckCircle, Package
} from 'lucide-react';
import { Product } from '../types';

interface DistributorManagementProps {
  product: Product;
  onUpdateMargin: (margin: number) => void;
  onShipToRetailer: () => void;
}

export const DistributorManagement: React.FC<DistributorManagementProps> = ({
  product,
  onUpdateMargin,
  onShipToRetailer
}) => {
  const [margin, setMargin] = useState(product.distributorMargin);
  const [showMarginSlider, setShowMarginSlider] = useState(false);

  const sliderProps = useSpring({
    width: showMarginSlider ? '100%' : '0%',
    config: { tension: 300, friction: 20 }
  });

  const profitAmount = (product.price * (margin / 100));
  const finalPrice = product.price + profitAmount;

  const getMarginColor = (margin: number) => {
    if (margin <= 15) return 'text-emerald-500';
    if (margin <= 25) return 'text-amber-500';
    return 'text-rose-500';
  };

  const marginColor = getMarginColor(margin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Distributor Controls
        </h3>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-purple-100 rounded-full"
        >
          <Package className="text-purple-600" size={24} />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="text-purple-600" size={20} />
            <span className="text-gray-600">Base Price</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            ${product.price.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className={marginColor} size={20} />
            <span className="text-gray-600">Margin</span>
          </div>
          <p className={`text-2xl font-bold ${marginColor}`}>
            {margin}%
          </p>
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="text-purple-600" size={24} />
            <h4 className="text-lg font-semibold text-gray-800">Margin Calculator</h4>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMarginSlider(!showMarginSlider)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Adjust Margin
          </motion.button>
        </div>

        <AnimatePresence>
          {showMarginSlider && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4"
            >
              <animated.div style={sliderProps}>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>5%</span>
                  <span>20%</span>
                  <span>40%</span>
                </div>
              </animated.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Base Price:</span>
            <span>${product.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Margin Amount:</span>
            <span className={marginColor}>
              +${profitAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
            <span>Final Price:</span>
            <span className="text-purple-600">
              ${finalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {margin > 25 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 mt-4 text-amber-600 bg-amber-50 p-3 rounded-lg"
          >
            <AlertTriangle size={20} />
            <span className="text-sm">High margin may affect sales volume</span>
          </motion.div>
        )}
      </motion.div>

      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onUpdateMargin(margin)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <CheckCircle size={20} />
          <span>Update Margin</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShipToRetailer}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Truck size={20} />
          <span>Ship to Retailer</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <PackageSearch className="text-purple-600" size={20} />
            <span className="text-gray-600">Quality Score</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {product.quality}%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-purple-600" size={20} />
            <span className="text-gray-600">Market Trend</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {product.marketAnalysis.trend}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};