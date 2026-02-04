import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/axiosInstance";
import { getDocuments } from "../api/documents"; 
import ChangePasswordModal from "../components/ChangePasswordModal";
import { Mail, User, Shield, FileText } from "lucide-react";

const AVATAR_URLS = [
  "https://i.pinimg.com/736x/bf/35/a9/bf35a9040be9155866dabb5818ddd4c3.jpg",
  "https://i.pinimg.com/736x/a0/b9/81/a0b981387dd4fb99fc19798cacaf3c56.jpg",
  "https://i.pinimg.com/736x/1f/98/15/1f9815f93ce1a16bee32443804d002a0.jpg",
  "https://i.pinimg.com/1200x/79/61/d8/7961d85f3e78552fdcd75e3659e00952.jpg",
  "https://i.pinimg.com/736x/4e/97/4a/4e974a1b4f024811d20f75f639425156.jpg",
  "https://i.pinimg.com/1200x/e7/9f/ca/e79fcaefef85b2d634dd7eab1318664b.jpg"
];

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [userRes, docRes] = await Promise.all([
          API.get("/user/me"),
          getDocuments(1)
        ]);

        const user = userRes.data;
        setUserInfo(user);
        setDocCount(docRes.data.total_documents || 0);
        const avatarIndex = (user.email?.length || 0) % AVATAR_URLS.length;
        setAvatar(AVATAR_URLS[avatarIndex]);

      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center">
             <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
             <div className="h-4 w-32 bg-gray-200 rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 border-b border-gray-100 pb-8">
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover bg-gray-100 border border-gray-200"
              />
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{userInfo?.name || "User"}</h2>
                <p className="text-gray-500 text-sm">CTRL-INTEL app user</p>
              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Shield size={16} /> Change Password
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                
                <div className="group">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User size={18} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">{userInfo?.name}</span>
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">{userInfo?.email}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 h-fit">
                <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600"/> Account Statistics
                </h3>
                
                <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm flex items-center justify-between mb-3">
                  <div>
                    <div className="text-3xl font-extrabold text-gray-900">{docCount}</div>
                    <div className="text-xs text-gray-500 font-semibold uppercase mt-1">Documents Processed</div>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                  </div>
                </div>
                
                <div className="text-xs text-blue-600/80 leading-relaxed font-medium">
                  Total control narrative documents you have successfully uploaded and parsed since account creation.
                </div>
              </div>

            </div>
          </div>
        </div>
        {showPasswordModal && (
          <ChangePasswordModal
            closeModal={() => setShowPasswordModal(false)}
          />
        )}
      </div>
    </div>
  );
}