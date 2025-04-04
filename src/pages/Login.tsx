import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, Key, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { authenticateUser } from '../utils/blockchain';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'manufacturer' | 'distributor' | 'retailer'>('manufacturer');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const user = authenticateUser({ role, password });
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } else {
      setError('Invalid password. Please check the demo credentials below.');
    }
    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const logoVariants = {
    hidden: { scale: 0.8, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="flex items-center justify-center mb-8 cursor-pointer"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <Boxes size={48} className="text-blue-600" />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
          >
            SupplyMasters
          </motion.h1>
        </motion.div>

        <motion.form
          variants={containerVariants}
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <UserCheck className="mr-2 text-blue-500" size={18} />
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'manufacturer' | 'distributor' | 'retailer')}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:bg-white/70"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Lock className="mr-2 text-blue-500" size={18} />
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm pr-10 transition-all duration-200 hover:bg-white/70"
                placeholder="Enter password"
              />
              <Key className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-500 text-sm flex items-center"
            >
              <ShieldCheck className="mr-2" size={16} />
              {error}
            </motion.p>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Lock className="mr-2" size={18} />
                  Login
                </>
              )}
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
              animate={{ scale: 1.5 }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>
        </motion.form>

        <motion.div
          variants={containerVariants}
          className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100"
        >
          <motion.p variants={itemVariants} className="text-sm text-gray-600 font-medium mb-2 flex items-center">
            <Key className="mr-2 text-blue-500" size={16} />
            Demo Credentials:
          </motion.p>
          <motion.ul variants={itemVariants} className="text-sm text-gray-500 space-y-1">
            <li className="flex items-center">
              <span className="w-24">Manufacturer:</span>
              <code className="bg-blue-50 px-2 py-0.5 rounded">mfg123</code>
            </li>
            <li className="flex items-center">
              <span className="w-24">Distributor:</span>
              <code className="bg-blue-50 px-2 py-0.5 rounded">dist123</code>
            </li>
            <li className="flex items-center">
              <span className="w-24">Retailer:</span>
              <code className="bg-blue-50 px-2 py-0.5 rounded">ret123</code>
            </li>
          </motion.ul>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-4 text-center text-sm text-gray-500"
        >
          Created by AYUSH THAKUR © {new Date().getFullYear()} SupplyMasters. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
};