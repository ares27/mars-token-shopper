import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import { Search, Loader2, CheckCircle2, Package, User } from "lucide-react";
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

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  console.log(profile);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [inputCodes, setInputCodes] = useState<{ [orderId: string]: string }>(
    {},
  );
  const [isProcessing, setIsProcessing] = useState<{
    [orderId: string]: boolean;
  }>({});

  const fetchOrders = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch("http://localhost:5000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFinalize = async (orderId: string, code: string) => {
    if (code.length !== 6) return;

    try {
      setIsProcessing((prev) => ({ ...prev, [orderId]: true }));
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/redemption/redeem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ collectionCode: code }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Redemption failed");
      }

      alert(`Success! Order ${orderId} finalized.`);
      fetchOrders(); // Refresh table
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.collectionCode?.includes(search) ||
      order.userId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-velvet">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Manage customer orders and token redemptions.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID, Code, or User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-indigo-velvet outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Order Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Items
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Finalize
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-velvet mx-auto mb-4" />
                    <p className="text-gray-500">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-velvet/5 rounded-lg">
                          <Package className="w-5 h-5 text-indigo-velvet" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-indigo-velvet truncate max-w-[120px]">
                            #{order.id}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt._seconds * 1000,
                                ).toLocaleString()
                              : "Just now"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 truncate max-w-[100px]">
                          {order.userId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-velvet">
                          {order.totalPrice || (order as any).price || 0} MTK
                        </p>
                        <p className="text-xs text-gray-400 font-medium truncate max-w-[150px]">
                          {order.items?.map((item) => item.name).join(", ") ||
                            (order as any).itemName ||
                            "No items"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-moss-green/10 text-moss-green"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {order.status === "PENDING" ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Code"
                            value={inputCodes[order.id] || ""}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setInputCodes((prev) => ({
                                ...prev,
                                [order.id]: e.target.value.replace(/\D/g, ""),
                              }))
                            }
                            className="w-24 px-3 py-2 text-sm font-black tracking-widest rounded-lg bg-gray-50 border border-gray-100 focus:border-indigo-velvet outline-none transition-all"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFinalize(
                                order.id,
                                inputCodes[order.id] || "",
                              );
                            }}
                            disabled={
                              isProcessing[order.id] ||
                              inputCodes[order.id]?.length !== 6
                            }
                            className="bg-indigo-velvet text-white p-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-20"
                          >
                            {isProcessing[order.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-moss-green space-x-2 text-sm font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Completed</span>
                        </div>
                      )}
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

export default AdminDashboard;
