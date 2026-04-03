import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Coins, User, LogOut, ShoppingCart } from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import marsLogo from "../assets/mars-logo.png";

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-indigo-velvet text-white p-4 flex justify-between items-center shadow-xl border-b border-white/5">
      <div className="flex items-center space-x-3">
        <img
          src={marsLogo}
          alt="MarsGrow"
          className="w-10 h-10 object-contain rounded-lg"
        />
        <h1 className="text-xl font-black tracking-tight text-pumpkin-spice uppercase italic">
          MarsGrow
        </h1>
      </div>

      {user && profile && (
        <div className="flex items-center space-x-4">
          <Link
            to="/cart"
            className="relative p-2 text-white/80 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-pumpkin-spice text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-velvet shadow-sm transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/topup"
            className="bg-white/10 px-3 py-1 rounded-full flex items-center space-x-2 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-pumpkin-spice" />
            <span className="font-semibold">
              {profile?.balance ?? 0} <span className="text-xs">MTK</span>
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-moss-green" />
            <span className="hidden md:inline-block text-sm opacity-80">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-1 hover:text-pumpkin-spice transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
