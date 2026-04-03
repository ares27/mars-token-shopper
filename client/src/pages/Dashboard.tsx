import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ShoppingBag,
  Wallet,
  ShieldCheck,
  QrCode,
  LayoutDashboard,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-pumpkin-spice/10 rounded-xl">
              <Wallet className="w-6 h-6 text-pumpkin-spice" />
            </div>
            <h3 className="text-lg font-bold text-indigo-velvet">My Wallet</h3>
          </div>
          <div className="text-3xl font-extrabold text-indigo-velvet mb-2">
            {profile?.balance ?? 0}{" "}
            <span className="text-sm font-medium text-gray-500 uppercase">
              MTK
            </span>
          </div>
          <p className="text-sm text-gray-500">Your current token balance</p>
          <Link
            to="/topup"
            className="block w-full text-center mt-4 bg-pumpkin-spice text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Top Up Tokens
          </Link>
        </div>

        {/* Action Card - Store */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-indigo-velvet/10 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-indigo-velvet" />
            </div>
            <h3 className="text-lg font-bold text-indigo-velvet">Storefront</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Browse products and redeem your tokens for goodies.
          </p>
          <Link
            to="/store"
            className="block w-full text-center border border-indigo-velvet text-indigo-velvet font-bold py-2 rounded-lg hover:bg-indigo-velvet hover:text-white transition-all"
          >
            Visit Store
          </Link>
        </div>

        {/* Conditional Card based on role */}
        {profile?.role === "staff" || profile?.role === "admin" ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-moss-green/10 p-6 rounded-2xl border border-moss-green/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-moss-green/20 rounded-xl">
                  <QrCode className="w-6 h-6 text-moss-green" />
                </div>
                <h3 className="text-lg font-bold text-indigo-velvet">
                  Redemption Desk
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Validate customer collection PINs and finalize transactions.
              </p>
              <Link
                to="/redeem"
                className="block w-full text-center bg-moss-green text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all"
              >
                Enter PIN
              </Link>
            </div>

            <div className="bg-indigo-velvet text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/10 rounded-xl text-pumpkin-spice">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Admin Panel</h3>
              </div>
              <p className="text-white/60 text-sm mb-6">
                View all orders and manage redemptions in real-time.
              </p>
              <Link
                to="/admin"
                className="block w-full text-center bg-white text-indigo-velvet font-bold py-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              Verified and Secured by MarsGrow Ledger
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
