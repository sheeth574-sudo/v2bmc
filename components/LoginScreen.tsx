import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types';
import { Users, Briefcase, ChevronRight, User as UserIcon } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { allUsers, login } = useUser();
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.BRAND);

  const filteredUsers = allUsers.filter(u => u.role === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Info */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-indigo-500/30">
              C
            </div>
            <h1 className="text-3xl font-bold mb-2">CollabSphere</h1>
            <p className="text-slate-400">Simulation Environment</p>
            
            <div className="mt-12 space-y-6">
              <div>
                <h3 className="text-indigo-400 font-semibold mb-1">Select a Persona</h3>
                <p className="text-sm text-slate-400">Choose a Brand or Creator account to explore the platform's features.</p>
              </div>
              <div>
                 <h3 className="text-emerald-400 font-semibold mb-1">Test the Flow</h3>
                 <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                   <li>Connect Mock TikTok</li>
                   <li>Request Samples</li>
                   <li>Submit Content</li>
                   <li>Track Payments</li>
                 </ul>
              </div>
            </div>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-600 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Right Side: User List */}
        <div className="md:w-7/12 p-8 md:p-12">
          <div className="flex gap-4 border-b border-slate-200 mb-6">
             <button 
              onClick={() => setActiveTab(UserRole.BRAND)}
              className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === UserRole.BRAND ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <Briefcase size={18} /> Brands
               {activeTab === UserRole.BRAND && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
             </button>
             <button 
              onClick={() => setActiveTab(UserRole.CREATOR)}
              className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === UserRole.CREATOR ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <Users size={18} /> Creators
               {activeTab === UserRole.CREATOR && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>}
             </button>
          </div>

          <div className="grid grid-cols-1 gap-3 h-[400px] overflow-y-auto pr-2">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => login(user.id)}
                className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all group text-left"
              >
                <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">{user.name}</h3>
                  <p className="text-xs text-slate-500">
                    {user.role === UserRole.BRAND ? user.companyName : user.socialStats?.handle}
                  </p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500" size={20} />
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Click any user above to simulate login.</p>
          </div>
        </div>
      </div>
    </div>
  );
};