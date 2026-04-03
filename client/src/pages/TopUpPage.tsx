import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Wallet, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
// REMOVED: import { usePaystackPayment } from "react-paystack";
import { db, auth } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const TopUpPage: React.FC = () => {
  const { profile } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);

  const publicKey =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key";

  const handleTopUp = async () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      alert("Please ensure you are fully logged in with a valid email.");
      return;
    }

    // 1. Generate the unique reference
    const reference = `MG-${new Date().getTime()}`;

    try {
      setIsProcessing(true);

      // 2. Pre-flight: Create the "Pending" request in Firestore
      await setDoc(doc(db, "buy_requests", reference), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount: amount,
        status: "pending",
        createdAt: serverTimestamp(),
        reference: reference,
      });

      // 3. Initialize Paystack Native Popup
      // We use (window as any) to bypass TypeScript's check on the global window object
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: auth.currentUser.email,
        amount: amount * 100, // ZAR to Cents
        currency: "ZAR",
        ref: reference,
        metadata: {
          userId: auth.currentUser.uid,
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "userId",
              value: auth.currentUser.uid,
            },
          ],
        },
        callback: (response: any) => {
          // Success callback: payment completed by user
          console.log("Payment successful, waiting for webhook...", response);
          // Keep isProcessing true so they see the processing screen while the webhook runs
        },
        onClose: () => {
          console.log("Payment window closed");
          setIsProcessing(false);
        },
      });

      // 4. Open the Iframe
      handler.openIframe();
    } catch (error) {
      console.error("Error creating buy request:", error);
      alert("Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // Processing Screen (Keep as is, it looks great)
  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="w-16 h-16 text-pumpkin-spice animate-spin mb-6" />
        <h2 className="text-3xl font-black text-indigo-velvet mb-2">
          Processing Payment
        </h2>
        <p className="text-gray-500 max-w-sm">
          Please wait while we verify your transaction. Your tokens will appear
          in your wallet shortly.
        </p>
        <button
          onClick={() => setIsProcessing(false)}
          className="mt-8 text-indigo-velvet font-bold underline"
        >
          Return to Top Up
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-velvet p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Wallet className="w-8 h-8 text-pumpkin-spice" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Top Up Tokens</h1>
              <p className="text-white/60">
                Securely buy MarsGrow Tokens (MTK)
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-baseline space-x-2">
            <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Current Balance:
            </span>
            <span className="text-3xl font-black text-pumpkin-spice">
              {profile?.balance ?? 0} MTK
            </span>
          </div>
        </div>

        <div className="p-8">
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Select Amount
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[50, 100, 200, 500].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-4 rounded-2xl font-black text-xl transition-all border-2 ${
                  amount === val
                    ? "border-indigo-velvet bg-indigo-velvet/5 text-indigo-velvet"
                    : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                R{val}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Exchange Rate</span>
              <span className="font-bold text-indigo-velvet">
                1 ZAR = 1 MTK
              </span>
            </div>
            <div className="flex justify-between items-center text-xl font-black">
              <span className="text-indigo-velvet">Total to Pay</span>
              <span className="text-indigo-velvet">R{amount}.00</span>
            </div>
          </div>

          <button
            onClick={handleTopUp}
            className="w-full bg-pumpkin-spice text-white font-black py-4 rounded-2xl text-xl shadow-lg shadow-pumpkin-spice/20 hover:bg-opacity-90 transition-all flex items-center justify-center space-x-3"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Secured by Paystack & MarsGrow Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpPage;
