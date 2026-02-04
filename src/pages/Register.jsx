import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, CheckCircle, XCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    number: false,
    special: false
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pwd = form.password;
    setPasswordCriteria({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  }, [form.password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = form;
      const res = await registerRequest(dataToSend);
      login(res.data.access_token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-50 h-full">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Get started for free</p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 text-red-700 text-xs rounded flex items-center gap-2 border border-red-100">
              <XCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-9 w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Surya Prakash"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="pl-9 w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="pl-9 w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className={`w-full p-2.5 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 outline-none transition-all ${
                      form.confirmPassword && form.password !== form.confirmPassword 
                      ? "border-red-300 focus:ring-red-200" 
                      : "border-gray-200 focus:ring-blue-500"
                    }`}
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                <Requirement met={passwordCriteria.length} label="8+ Chars" />
                <Requirement met={passwordCriteria.upper} label="Uppercase" />
                <Requirement met={passwordCriteria.number} label="Number" />
                <Requirement met={passwordCriteria.special} label="Symbol" />
              </div>
            </div>

            <button
              disabled={loading || !isPasswordValid}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-right">
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900 to-blue-950 z-0" />
        <div 
          className="absolute inset-0 opacity-[0.03] z-0" 
          style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-lg flex flex-col items-end">
          
          <div className="mb-6">
            <img 
              src="/logo.png" 
              alt="Company Logo" 
              className="h-14 w-auto object-contain opacity-90"
            />
          </div>

          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-white">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Platform
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-light">
            Create an account to start parsing complex control narratives with AI-driven precision.
          </p>
        </div>
      </div>

    </div>
  );
}

function Requirement({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] transition-colors ${met ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
      {met ? (
        <CheckCircle size={12} className="text-blue-600 fill-blue-100" />
      ) : (
        <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
      )}
      {label}
    </div>
  );
}