import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  FileText, 
  Bot, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Bot className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">CTRL-INTEL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              AI-Powered Audit Tech
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.15]">
              Master your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Control Narratives
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Stop manually parsing dense audit documents. Upload your files, let our AI extract the logic, and chat with your data instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="inline-flex justify-center items-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:shadow-2xl hover:shadow-blue-200"
              >
                Start for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex justify-center items-center px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Live Demo
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Instant Extraction</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-12 -right-12 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Payroll_Controls_v2.pdf</h3>
                    <p className="text-xs text-green-600 font-medium">Processed Successfully</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Extracted Logic</p>
                  <p className="text-sm text-gray-700 font-mono">
                    IF employee_status == 'terminated' THEN <br/>
                    &nbsp;&nbsp;revoke_access(system_all) <br/>
                    &nbsp;&nbsp;AND notify(hr_admin)
                  </p>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none text-sm text-blue-900">
                    Based on the document, access must be revoked within 24 hours of termination.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <section className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-2">Streamline your audit workflow in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Upload Documents</h3>
              <p className="text-gray-500">
                Drag and drop your control narratives, policies, or SOPs. We support PDF, Docx, and Text formats.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. AI Extraction</h3>
              <p className="text-gray-500">
                The LLM engine parses unstructured text into logical rules, identifying key controls and gaps automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Verify & Query</h3>
              <p className="text-gray-500">
                Chat with your documents to verify compliance. Ask questions like "Is this SOC2 compliant?"
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2026 Control Narrative AI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="text-gray-400 hover:text-gray-600 text-sm">Privacy</Link>
            <Link to="#" className="text-gray-400 hover:text-gray-600 text-sm">Terms</Link>
            <Link to="#" className="text-gray-400 hover:text-gray-600 text-sm">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}