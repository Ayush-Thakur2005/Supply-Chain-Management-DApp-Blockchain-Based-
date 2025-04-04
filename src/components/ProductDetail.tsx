import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, Truck, DollarSign, CheckCircle, 
  Thermometer, Droplets, BadgeCheck, Tag,
  ClipboardCheck, AlertTriangle, ShieldCheck, 
  Gauge, Award, Scale, PackageCheck
} from 'lucide-react';
import { Product, Transaction } from '../types';
import { Map } from './Map';
import { PaymentModal } from './PaymentModal';
import { inspectProduct, updateRetailPrice } from '../utils/blockchain';
import { TradingChart } from './TradingChart';
import { DistributorManagement } from './DistributorManagement';

interface ProductDetailProps {
  product: Product;
  transactions: Transaction[];
  onClose: () => void;
  onUpdateStatus: (newStatus: 'manufactured' | 'in-transit' | 'delivered') => void;
  onProcessPayment: () => void;
  userRole: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  transactions,
  onClose,
  onUpdateStatus,
  onProcessPayment,
  userRole,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [newRetailPrice, setNewRetailPrice] = useState(product.retailPrice);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showInspectionDetails, setShowInspectionDetails] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [setProduct] = useState(product);

  const inspectionCriteria = [
    { id: 'quality', label: 'Quality Check', icon: PackageCheck },
    { id: 'safety', label: 'Safety Standards', icon: ShieldCheck },
    { id: 'compliance', label: 'Regulatory Compliance', icon: ClipboardCheck },
    { id: 'certification', label: 'Certification Verification', icon: Award },
    { id: 'measurement', label: 'Weight & Dimensions', icon: Scale },
    { id: 'performance', label: 'Performance Metrics', icon: Gauge }
  ];

  const canUpdateStatus = () => {
    if (userRole === 'manufacturer' && product.status === 'manufactured') return true;
    if (userRole === 'distributor' && product.status === 'in-transit') return true;
    if (userRole === 'retailer' && product.status === 'in-transit') return true;
    return false;
  };

  const handlePayment = () => {
    onProcessPayment();
    setShowPayment(false);
  };

  const handleInspection = () => {
    if (selectedCriteria.length === 0) {
      alert('Please select at least one inspection criteria');
      return;
    }
    inspectProduct(product.id, userRole);
    setShowInspectionDetails(false);
    setSelectedCriteria([]);
    setInspectionNotes('');
  };

  const handleRetailPriceUpdate = () => {
    updateRetailPrice(product.id, newRetailPrice);
    setShowPriceInput(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'manufactured':
        return 'bg-rose-100 text-rose-700';
      case 'in-transit':
        return 'bg-amber-100 text-amber-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-emerald-600';
    if (quality >= 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getInspectionStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-100 text-emerald-700';
      case 'failed':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl my-8 relative"
      >
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl rounded-t-2xl border-b border-gray-200/50 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-gray-600">Current Location</p>
                  <p className="font-medium text-gray-800">{product.currentLocation}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium px-3 py-1 rounded-full text-sm inline-block mt-1 ${getStatusColor(product.status)}`}>
                    {product.status}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="font-medium text-rose-600 flex items-center">
                    <DollarSign size={16} />
                    {product.price.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <p className="text-sm text-gray-600">Retail Price</p>
                  <p className="font-medium text-amber-600 flex items-center">
                    <DollarSign size={16} />
                    {product.retailPrice.toLocaleString()}
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <BadgeCheck size={20} className={getQualityColor(product.quality)} />
                    <p className="text-sm text-gray-600">Quality</p>
                  </div>
                  <p className={`text-lg font-semibold ${getQualityColor(product.quality)}`}>
                    {product.quality}%
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Thermometer size={20} className="text-rose-600" />
                    <p className="text-sm text-gray-600">Temperature</p>
                  </div>
                  <p className="text-lg font-semibold text-rose-600">
                    {product.temperature}°C
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets size={20} className="text-amber-600" />
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                  <p className="text-lg font-semibold text-amber-600">
                    {product.humidity}%
                  </p>
                </motion.div>
              </div>

              {userRole === 'retailer' && (
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-rose-50 to-amber-50 p-4 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <ClipboardCheck size={24} className="text-rose-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Inspection Status</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInspectionStatusColor(product.inspectionStatus)}`}>
                        {product.inspectionStatus}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowInspectionDetails(true)}
                      className="w-full bg-gradient-to-r from-rose-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-rose-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Start New Inspection
                    </motion.button>
                  </motion.div>

                  {!showPriceInput ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPriceInput(true)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Tag size={20} />
                        <span>Update Retail Price</span>
                      </div>
                    </motion.button>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={newRetailPrice}
                        onChange={(e) => setNewRetailPrice(Number(e.target.value))}
                        className="flex-1 px-4 py-2 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRetailPriceUpdate}
                        className="bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700"
                      >
                        Update
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {userRole === 'distributor' && (
                <DistributorManagement
                  product={product}
                  onUpdateMargin={(newMargin) => {
                    const updatedProduct = { ...product, distributorMargin: newMargin };
                    setProduct(updatedProduct);
                    onUpdateStatus(product.status);
                  }}
                  onShipToRetailer={() => {
                    setShowPayment(true);
                  }}
                />
              )}

              {canUpdateStatus() && (
                <div className="flex space-x-4">
                  {product.status === 'manufactured' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPayment(true)}
                      className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:from-rose-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Truck size={20} />
                      <span>Ship to Distributor</span>
                    </motion.button>
                  )}
                  {product.status === 'in-transit' && userRole === 'retailer' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onUpdateStatus('delivered')}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Mark as Delivered
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <Map product={product} />
            </div>
          </div>

          <div className="mt-6">
            <TradingChart 
              priceHistory={product.priceHistory} 
              title="Product Market Price History" 
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Transaction History
            </h3>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={tx.hash}
                  className="border border-gray-200/50 rounded-xl p-6 space-y-3 hover:shadow-lg transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded-lg">
                      {tx.from.slice(0, 6)}...
                    </span>
                    <ArrowRight size={16} />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded-lg">
                      {tx.to.slice(0, 6)}...
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">{tx.action}</p>
                  {tx.amount && (
                    <p className="text-rose-600 flex items-center text-lg font-semibold">
                      <DollarSign size={18} />
                      {tx.amount.toLocaleString()}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    <span className="font-mono">TX: {tx.hash.slice(0, 10)}...</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            product={product}
            onClose={() => setShowPayment(false)}
            onConfirm={() => {
              handlePayment();
              onUpdateStatus('in-transit');
            }}
          />
        )}

        {showInspectionDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                  Product Inspection
                </h3>
                <button
                  onClick={() => setShowInspectionDetails(false)}
                  className="text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {inspectionCriteria.map((criteria) => {
                    const Icon = criteria.icon;
                    const isSelected = selectedCriteria.includes(criteria.id);
                    return (
                      <motion.button
                        key={criteria.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCriteria(selectedCriteria.filter(id => id !== criteria.id));
                          } else {
                            setSelectedCriteria([...selectedCriteria, criteria.id]);
                          }
                        }}
                        className={`p-4 rounded-xl flex items-center space-x-3 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-medium">{criteria.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Notes
                  </label>
                  <textarea
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                    placeholder="Enter detailed inspection notes..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowInspectionDetails(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInspection}
                    className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-rose-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Complete Inspection
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};