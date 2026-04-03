import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { auth } from "../lib/firebase";
import { Trash2, ShoppingBag, CheckCircle2, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const CartPage: React.FC = () => {
  const { profile } = useAuth();
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<{
    orderId: string;
    collectionCode: string;
  } | null>(null);

  const handleCheckout = async () => {
    if (!auth.currentUser) return;
    if (cart.length === 0) return;

    try {
      setIsRedeeming(true);
      const idToken = await auth.currentUser.getIdToken();
      const itemIds = cart.map((item) => item.id);

      const response = await fetch("http://localhost:5000/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ itemIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setRedemptionResult(data);
      clearCart();
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  if (cart.length === 0 && !redemptionResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 rounded-3xl p-12 border-2 border-dashed border-gray-200">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-indigo-velvet mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/store"
            className="inline-block bg-indigo-velvet text-white font-bold px-8 py-4 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-indigo-velvet/20"
          >
            Visit Dispensary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success Modal */}
      {redemptionResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-velvet/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center">
              <div className="w-20 h-20 bg-moss-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-moss-green" />
              </div>
              <h2 className="text-3xl font-black text-indigo-velvet mb-2">
                Success!
              </h2>
              <p className="text-gray-500 mb-8">
                Items redeemed. Use the code below for collection.
              </p>
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl mb-8">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Collection Code
                </p>
                <p className="text-5xl font-black text-indigo-velvet tracking-[0.2em]">
                  {redemptionResult.collectionCode}
                </p>
              </div>
              <Link
                to="/"
                className="block w-full bg-indigo-velvet text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-indigo-velvet mb-10">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-grow">
                <h3 className="font-bold text-indigo-velvet">{item.name}</h3>
                <p className="text-moss-green font-black">{item.price} MTK</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit sticky top-24">
          <h2 className="text-xl font-black text-indigo-velvet mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-500">
              <span>Items ({cart.length})</span>
              <span>{cartTotal} MTK</span>
            </div>
            <div className="flex justify-between text-xl font-black text-indigo-velvet pt-4 border-t border-gray-50">
              <span>Total Cost</span>
              <span>{cartTotal} MTK</span>
            </div>
          </div>

          <div className="bg-indigo-velvet/5 p-4 rounded-2xl mb-8">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Your Balance</span>
              <span className="font-bold text-indigo-velvet">
                {profile?.balance ?? 0} MTK
              </span>
            </div>
            {(profile?.balance ?? 0) < cartTotal && (
              <p className="text-xs text-red-500 font-bold">
                Insufficient balance. Please top up.
              </p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              isRedeeming ||
              cart.length === 0 ||
              (profile?.balance ?? 0) < cartTotal
            }
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-2 ${
              !isRedeeming &&
              (profile?.balance ?? 0) >= cartTotal &&
              cart.length > 0
                ? "bg-indigo-velvet text-white hover:bg-opacity-90 shadow-lg shadow-indigo-velvet/20"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isRedeeming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redeeming...</span>
              </>
            ) : (
              <span>Confirm Redemption</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
