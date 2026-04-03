import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Filter, Tag, CheckCircle2, X, ShoppingCart, Plus } from "lucide-react";
import { auth } from "../lib/firebase";

interface StoreItem {
  id: string;
  name: string;
  category: "indoor" | "outdoor" | "greenhouse";
  price: number;
  description: string;
  image: string;
  attributes: { thc: string; type: string };
  stock: number;
}

const StorePage: React.FC = () => {
  const { profile } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [filter, setFilter] = useState<
    "all" | "indoor" | "outdoor" | "greenhouse"
  >("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/store/items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems =
    filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Wallet Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-velvet">
            The Dispensary
          </h1>
          <p className="text-gray-500 mt-2">
            Premium selections for the MarsGrow community.
          </p>
        </div>
        <div className="bg-white border-2 border-pumpkin-spice/20 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
          <ShoppingCart className="text-pumpkin-spice w-6 h-6" />
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Available Balance
            </p>
            <p className="text-2xl font-black text-indigo-velvet">
              {profile?.balance ?? 0} MTK
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Filter className="w-5 h-5 text-gray-400 mr-2" />
        {["all", "indoor", "greenhouse", "outdoor"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all ${
              filter === cat
                ? "bg-indigo-velvet text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-velvet hover:text-indigo-velvet"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 animate-pulse rounded-3xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${
                      item.category === "indoor"
                        ? "bg-indigo-velvet"
                        : item.category === "greenhouse"
                          ? "bg-moss-green"
                          : "bg-pumpkin-spice"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-indigo-velvet">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs font-bold text-moss-green bg-moss-green/10 px-2 py-1 rounded">
                    <Tag className="w-3 h-3" />
                    <span>{item.attributes.thc} THC</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold uppercase">
                      Cost
                    </span>
                    <span className="text-2xl font-black text-indigo-velvet">
                      {item.price}{" "}
                      <span className="text-sm font-medium">MTK</span>
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center space-x-2 bg-indigo-velvet text-white px-5 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-indigo-velvet/20"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorePage;
