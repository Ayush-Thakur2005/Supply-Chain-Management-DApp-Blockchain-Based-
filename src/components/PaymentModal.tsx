import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface PaymentModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');

  const handlePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('completed');
      setTimeout(() => {
        onConfirm();
      }, 1500);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative backdrop-blur-xl bg-white/90"
      >
        {paymentStatus === 'pending' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Process Payment
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Amount Due:</span>
                  <div className="flex items-center text-2xl font-bold text-indigo-600">
                    <DollarSign size={24} className="mr-1" />
                    {product.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h4 className="font-semibold text-indigo-800 mb-2">Payment Details</h4>
                <p className="text-sm text-indigo-600">
                  This payment will be processed securely through our blockchain network.
                  The transaction will be verified and recorded immediately.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Pay Now
                </motion.button>
              </div>
            </div>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6 text-indigo-600"
            >
              <Loader2 size={48} />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we verify your transaction...</p>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-block mb-6 text-green-500"
            >
              <CheckCircle size={64} />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Your payment has been processed and verified.</p>
            <div className="text-3xl font-bold text-green-600 flex items-center justify-center bg-green-50 p-4 rounded-xl">
              <DollarSign size={28} />
              {product.price.toLocaleString()}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};