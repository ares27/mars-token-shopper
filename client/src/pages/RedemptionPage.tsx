import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const RedemptionPage: React.FC = () => {
  const { profile } = useAuth();
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    itemName?: string;
  } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    try {
      setIsProcessing(true);
      setResult(null);
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

      setResult({
        success: true,
        message: "Order finalized successfully!",
        itemName: data.itemName,
      });
      setCode(""); // Clear code on success
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (profile?.role !== "staff" && profile?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-indigo-velvet mb-2">
          Access Denied
        </h2>
        <p className="text-gray-500 mb-6">
          This area is reserved for staff members only.
        </p>
        <Link to="/" className="text-indigo-velvet font-bold underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        to="/"
        className="flex items-center space-x-2 text-gray-400 hover:text-indigo-velvet mb-8 transition-colors font-bold"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-moss-green p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Redemption Desk</h1>
              <p className="text-white/60">
                Validate customer collection codes
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleRedeem} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
                Enter 6-Digit PIN
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full text-center text-5xl font-black tracking-[0.3em] py-6 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-moss-green focus:ring-4 focus:ring-moss-green/10 outline-none transition-all text-indigo-velvet"
                required
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6 || isProcessing}
              className={`w-full py-5 rounded-2xl text-xl font-black transition-all flex items-center justify-center space-x-3 shadow-lg ${
                code.length === 6 && !isProcessing
                  ? "bg-moss-green text-white hover:bg-opacity-90 shadow-moss-green/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Finalize Order</span>
              )}
            </button>
          </form>

          {result && (
            <div
              className={`mt-8 p-6 rounded-2xl border flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
                result.success
                  ? "bg-moss-green/5 border-moss-green/20"
                  : "bg-red-50 border-red-100"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-moss-green shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              )}
              <div>
                <p
                  className={`font-bold ${result.success ? "text-indigo-velvet" : "text-red-600"}`}
                >
                  {result.message}
                </p>
                {result.itemName && (
                  <p className="text-gray-500 mt-1">
                    Item:{" "}
                    <span className="font-bold text-indigo-velvet">
                      {result.itemName}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Staff Instructions
            </h3>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-moss-green" />
                <span>Ask customer for their 6-digit collection code.</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-moss-green" />
                <span>Verify code matches the order in the ledger.</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-moss-green" />
                <span>
                  Hand over the item only after "Success" is displayed.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedemptionPage;
