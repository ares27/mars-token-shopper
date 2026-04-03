import React from "react";
import { X, Package, Clock, ShieldCheck, User } from "lucide-react";

interface Order {
  id: string;
  userId: string;
  items: { id: string; name: string; price: number }[];
  totalPrice: number;
  collectionCode: string;
  status: "PENDING" | "COLLECTED" | "REDEEMED";
  createdAt: any;
}

interface Props {
  order: Order;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<Props> = ({ order, onClose }) => {
  const formatDate = (ts: any) => {
    if (!ts) return "Just now";
    const date = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-indigo-velvet/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-velvet text-white rounded-xl shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-velvet uppercase tracking-tight">
                Order Detail
              </h3>
              <p className="text-xs font-bold text-gray-400">ID: #{order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-indigo-velvet"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-pumpkin-spice" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Ordered On
                  </p>
                  <p className="text-sm font-bold text-indigo-velvet">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-moss-green" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Customer UID
                  </p>
                  <p className="text-sm font-bold text-indigo-velvet truncate max-w-[200px]">
                    {order.userId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-1.5 rounded-full ${order.status === "PENDING" ? "bg-amber-100" : "bg-emerald-100"}`}
                >
                  <ShieldCheck
                    className={`w-4 h-4 ${order.status === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </p>
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      order.status === "PENDING"
                        ? "text-amber-600 bg-amber-50"
                        : "text-emerald-600 bg-emerald-50"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="bg-indigo-velvet/5 p-4 rounded-2xl border border-indigo-velvet/10">
                <p className="text-xs font-bold text-indigo-velvet/40 uppercase tracking-widest mb-1">
                  Collection PIN
                </p>
                <p className="text-2xl font-black text-indigo-velvet tracking-[0.2em]">
                  {order.collectionCode}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-black text-indigo-velvet uppercase tracking-widest mb-4">
              Items Purchased
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-indigo-velvet/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-pumpkin-spice" />
                    <span className="font-bold text-indigo-velvet">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-black text-indigo-velvet opacity-60">
                    {item.price} MTK
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center bg-indigo-velvet p-6 rounded-3xl shadow-xl shadow-indigo-velvet/20">
            <span className="text-white font-bold uppercase tracking-widest text-sm opacity-60">
              Total Cost
            </span>
            <span className="text-3xl font-black text-pumpkin-spice">
              {order.totalPrice} MTK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
