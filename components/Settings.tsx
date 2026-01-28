import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types';
import { 
  Save, Building, CreditCard, MapPin, Share2, Loader2, CheckCircle, Smartphone, User, RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  
  // Local state form
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        companyName: user.companyName,
        address: user.shippingAddress,
        bankName: user.bankInfo?.bankName || '',
        accountNumber: user.bankInfo?.accountNumber || '',
        accountName: user.bankInfo?.accountName || user.name
      });
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const handleSave = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      updateUser({
        name: formData.name,
        companyName: formData.companyName,
        shippingAddress: formData.address,
        bankInfo: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName
        }
      });
      setLoading(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  const handleConnectTikTok = () => {
    setConnectLoading(true);
    setTimeout(() => {
      updateUser({
        socialStats: {
          platform: 'TikTok',
          handle: `@${user.name.toLowerCase().replace(' ', '_')}`,
          followers: '154.2K',
          avgViews: '45K',
          engagementRate: '5.2%',
          connected: true
        }
      });
      setConnectLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <User size={28} className="text-slate-400" />
        Account Settings
      </h1>

      {/* BRAND SETTINGS */}
      {user.role === UserRole.BRAND && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building className="text-indigo-600" size={20} /> Company Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName || ''}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                 <input 
                  type="text" 
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR SETTINGS */}
      {user.role === UserRole.CREATOR && (
        <div className="space-y-6">
          
          {/* Social Connection */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Share2 className="text-pink-600" size={20} /> Social Accounts
             </h2>
             
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                      <Smartphone size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">TikTok Account</h3>
                      {user.socialStats?.connected ? (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="font-medium text-slate-900">{user.socialStats.handle}</span>
                          <span className="px-2 py-0.5 bg-slate-200 rounded text-xs">{user.socialStats.followers} Followers</span>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Connect to verify your stats</p>
                      )}
                   </div>
                </div>
                
                {user.socialStats?.connected ? (
                   <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-white px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                      <CheckCircle size={16} /> Connected
                   </div>
                ) : (
                  <button 
                    onClick={handleConnectTikTok}
                    disabled={connectLoading}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    {connectLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                    Connect TikTok
                  </button>
                )}
             </div>
             
             {user.socialStats?.connected && (
               <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                     <p className="text-xs text-slate-500 uppercase">Avg Views</p>
                     <p className="font-bold text-slate-900">{user.socialStats.avgViews}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                     <p className="text-xs text-slate-500 uppercase">Engagement</p>
                     <p className="font-bold text-slate-900">{user.socialStats.engagementRate}</p>
                  </div>
                   <div className="bg-slate-50 p-3 rounded-lg text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={handleConnectTikTok}>
                     <p className="text-xs text-indigo-500 uppercase flex items-center justify-center gap-1"><RefreshCw size={10}/> Sync</p>
                     <p className="font-bold text-slate-400 text-xs mt-1">Updated Just now</p>
                  </div>
               </div>
             )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <MapPin className="text-orange-600" size={20} /> Shipping Info
             </h2>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Address (For receiving samples)</label>
                <textarea 
                  value={formData.address || ''}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="123 Street, City, Zip Code"
                />
             </div>
          </div>

          {/* Bank Info */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <CreditCard className="text-emerald-600" size={20} /> Payment Details
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                   <select 
                     value={formData.bankName}
                     onChange={e => setFormData({...formData, bankName: e.target.value})}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                     <option value="">Select Bank</option>
                     <option value="KBANK">Kasikornbank (KBANK)</option>
                     <option value="SCB">Siam Commercial Bank (SCB)</option>
                     <option value="BBL">Bangkok Bank (BBL)</option>
                     <option value="KTB">Krungthai Bank (KTB)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                   <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                    placeholder="xxx-x-xxxxx-x"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                   <input 
                    type="text" 
                    value={formData.accountName}
                    onChange={e => setFormData({...formData, accountName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>
    </div>
  );
};