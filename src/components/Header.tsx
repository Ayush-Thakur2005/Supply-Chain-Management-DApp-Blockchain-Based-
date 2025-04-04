import React from 'react';
import { Boxes } from 'lucide-react';

interface HeaderProps {
  userAddress: string;
  userName: string;
  userRole: string;
}

export const Header: React.FC<HeaderProps> = ({ userAddress, userName, userRole }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-white shadow-xl">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <Boxes size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SupplyMasters</h1>
              <p className="text-indigo-200 text-sm">Blockchain Supply Chain</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="font-medium text-lg">{userName}</p>
              <p className="text-indigo-200 capitalize">{userRole}</p>
              <p className="text-xs text-indigo-200 font-mono bg-white/10 px-2 py-1 rounded-lg mt-1">
                {userAddress}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-indigo-200">
          <p>Created by AYUSH THAKUR © {new Date().getFullYear()} SupplyMasters. All rights reserved.</p>
        </div>
      </div>
    </header>
  );
};