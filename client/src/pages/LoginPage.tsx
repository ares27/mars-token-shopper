import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "firebase/auth";
import {
  LogIn,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Phone,
  Mail,
  IdCard,
  Heart,
  Stethoscope,
  Activity,
  LogOut,
} from "lucide-react";
import marsLogo from "../assets/mars-logo.png";

const LoginPage: React.FC = () => {
  const { user: authUser, profile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is authenticated but has no profile, it's a new account from Google
  useEffect(() => {
    if (authUser && !profile) {
      setIsLogin(false);
      setEmail(authUser.email || "");
      setStep(1);
    }
  }, [authUser, profile]);

  // Signup fields
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    idNumber: "",
    gender: "",
    contactMethod: "",
    healthHistory: [] as string[],
    reasonForUse: "",
    usageMethod: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleHealth = (condition: string) => {
    setFormData((prev) => {
      const history = prev.healthHistory.includes(condition)
        ? prev.healthHistory.filter((c) => c !== condition)
        : [...prev.healthHistory, condition];
      return { ...prev, healthHistory: history };
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user has a profile in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If no profile, they need to complete signup
        // For simplicity, we'll redirect to step 1 of signup with their email prefilled
        setIsLogin(false);
        setEmail(user.email || "");
        // They don't need a password for Google signup
        setStep(1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.reasonForUse || !formData.usageMethod) {
      setError("Please complete all fields in this step");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        email,
        role: "user",
        balance: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google sign up profile completion (simplified for now: user must fill form)
  const completeGoogleSignup = async () => {
    if (!auth.currentUser) return;
    if (!formData.reasonForUse || !formData.usageMethod) {
      setError("Please complete all fields in this step");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        ...formData,
        email: auth.currentUser.email,
        role: "user",
        balance: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Basic validation per step
    if (
      step === 1 &&
      (!email ||
        (!password && !authUser) ||
        !formData.fullName ||
        !formData.contactNumber ||
        !formData.idNumber)
    ) {
      setError("Please fill in all account details");
      return;
    }
    if (step === 2 && (!formData.gender || !formData.contactMethod)) {
      setError("Please select your preferences");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };
  const prevStep = () => {
    setError("");
    setStep((s) => s - 1);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 px-4 py-12">
      <div
        className={`w-full ${step === 1 ? "max-w-md" : "max-w-2xl"} bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 transition-all duration-500`}
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner">
              <img
                src={marsLogo}
                alt="MarsGrow Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h2 className="text-4xl font-black text-indigo-velvet tracking-tight mb-2">
            {isLogin ? "Welcome Back" : `Join MarsGrow ${step}/3`}
          </h2>
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    !isLogin && step >= s
                      ? "bg-indigo-velvet w-8"
                      : "bg-gray-100 w-4"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">
            {isLogin
              ? "Login to manage your tokens"
              : "Complete your professional profile"}
          </p>
        </div>

        {isLogin ? (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-velvet outline-none transition-all font-medium"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="relative group">
                <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-velvet outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-velvet text-white font-black py-4 rounded-2xl hover:bg-opacity-90 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-indigo-velvet/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Activity className="animate-spin w-5 h-5" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                <span className="uppercase tracking-widest text-sm">
                  Sign In
                </span>
              </button>
            </form>

            <div className="mt-8">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-400 font-black uppercase tracking-[0.2em]">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full border border-gray-100 text-indigo-velvet font-black py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 shadow-sm active:scale-95"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                <span className="uppercase tracking-widest text-sm">
                  Google Account
                </span>
              </button>
            </div>

            <p className="mt-10 text-center text-gray-500 font-medium">
              New here?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-indigo-velvet font-black hover:underline underline-offset-4"
              >
                Create Account
              </button>
            </p>
          </>
        ) : (
          <div className="space-y-8">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-black text-indigo-velvet flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </h3>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet" />
                  <input
                    type="email"
                    value={email}
                    disabled={!!authUser}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all disabled:opacity-50"
                    placeholder="Email"
                    required
                  />
                </div>
                {!authUser && (
                  <div className="relative group">
                    <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all"
                      placeholder="Password"
                      required
                    />
                  </div>
                )}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet" />
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      updateFormData("contactNumber", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all"
                    placeholder="Contact Number"
                    required
                  />
                </div>
                <div className="relative group md:col-span-2">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-velvet" />
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => updateFormData("idNumber", e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all"
                    placeholder="ID Number / Passport"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-indigo-velvet flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>Gender Identity</span>
                  </h3>
                  <div className="flex space-x-4">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        onClick={() => updateFormData("gender", g)}
                        className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-widest ${
                          formData.gender === g
                            ? "border-indigo-velvet bg-indigo-velvet text-white"
                            : "border-gray-100 text-gray-400 hover:border-indigo-velvet/20"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black text-indigo-velvet flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>Communication</span>
                  </h3>
                  <select
                    value={formData.contactMethod}
                    onChange={(e) =>
                      updateFormData("contactMethod", e.target.value)
                    }
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all font-bold text-gray-600 appearance-none"
                  >
                    <option value="">Preferred Method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Do Not Contact">Do Not Contact</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Health & Wellness */}
            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-indigo-velvet flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-red-500" />
                    <span>Health History (Select all that apply)</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      "Pain",
                      "Anxiety",
                      "Epilepsy",
                      "Depression",
                      "Cancer",
                      "PTSD",
                      "Insomnia",
                      "Other",
                    ].map((cond) => (
                      <button
                        key={cond}
                        onClick={() => toggleHealth(cond)}
                        className={`py-3 px-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tighter ${
                          formData.healthHistory.includes(cond)
                            ? "bg-indigo-velvet text-white border-indigo-velvet shadow-lg shadow-indigo-velvet/20"
                            : "bg-white text-gray-400 border-gray-100 hover:border-indigo-velvet/20"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-indigo-velvet">
                      Reason For Use
                    </h3>
                    <div className="flex space-x-4">
                      {["Medical", "Recreational"].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateFormData("reasonForUse", r)}
                          className={`flex-1 py-4 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-widest ${
                            formData.reasonForUse === r
                              ? "border-indigo-velvet bg-indigo-velvet text-white"
                              : "border-gray-100 text-gray-400"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-indigo-velvet">
                      Preferred Method
                    </h3>
                    <select
                      value={formData.usageMethod}
                      onChange={(e) =>
                        updateFormData("usageMethod", e.target.value)
                      }
                      className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-indigo-velvet outline-none transition-all font-bold text-gray-600 appearance-none"
                    >
                      <option value="">Choose Method</option>
                      <option value="Smoking">Smoking</option>
                      <option value="Vaping">Vaping</option>
                      <option value="Edibles">Edibles</option>
                      <option value="Concentrates">Concentrates</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              {authUser ? (
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center space-x-2 text-red-400 font-black uppercase tracking-widest text-xs hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={step === 1 ? () => setIsLogin(true) : prevStep}
                  className="flex items-center space-x-2 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-indigo-velvet transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{step === 1 ? "Back to Login" : "Previous"}</span>
                </button>
              )}

              <button
                onClick={
                  step === 3
                    ? authUser
                      ? completeGoogleSignup
                      : handleSignup
                    : nextStep
                }
                disabled={loading}
                className="flex items-center space-x-3 bg-indigo-velvet text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-velvet/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Activity className="animate-spin w-5 h-5" />
                ) : step === 3 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Finish Signup</span>
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 text-center animate-bounce">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
