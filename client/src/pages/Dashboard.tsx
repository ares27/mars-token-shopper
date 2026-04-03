import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import {
  ShoppingBag,
  Wallet,
  ShieldCheck,
  QrCode,
  LayoutDashboard,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import OrderDetailsModal from "../components/OrderDetailsModal";

interface Order {
  id: string;
  userId: string;
  items: { id: string; name: string; price: number }[];
  totalPrice: number;
  collectionCode: string;
  status: "PENDING" | "COLLECTED" | "REDEEMED";
  createdAt: any;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchOrders = async (page: number) => {
    try {
      setLoading(true);
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/store/orders?page=${page}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

      {/* Order History Section */}
      <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-velvet text-white rounded-xl shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-velvet uppercase tracking-tight">
                Order History
              </h3>
              <p className="text-xs font-bold text-gray-400">
                Total {pagination.total} orders placed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-indigo-velvet" />
            </button>
            <span className="text-sm font-black text-indigo-velvet px-4">
              {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages || loading}
              className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-indigo-velvet" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  Order Details
                </th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  Total Price
                </th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-indigo-velvet border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm font-bold text-gray-400">
                        Fetching history...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-16 text-center text-gray-400 font-bold"
                  >
                    No orders yet. Start shopping!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-velvet/5 rounded-lg group-hover:bg-white transition-colors">
                          <Package className="w-5 h-5 text-indigo-velvet" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-indigo-velvet tracking-tight">
                            #{order.id}
                          </p>
                          <p className="text-xs font-bold text-gray-400">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt._seconds * 1000,
                                ).toLocaleDateString()
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-indigo-velvet">
                        {order.totalPrice} MTK
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                          order.status === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-xs font-black text-indigo-velvet uppercase tracking-widest hover:underline">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
