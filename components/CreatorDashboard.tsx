import React from 'react';
import { StatCardProps } from '../types';
import { DollarSign, Video, Zap, CheckCircle, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
          trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export const CreatorDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Earnings" 
          value="$4,250" 
          change="+15% vs last mo" 
          trend="up" 
          icon={<DollarSign size={20} />} 
        />
        <StatCard 
          title="Videos Submitted" 
          value="12" 
          icon={<Video size={20} />} 
        />
        <StatCard 
          title="Active Jobs" 
          value="4" 
          change="2 ending soon"
          trend="neutral"
          icon={<Zap size={20} />} 
        />
        <StatCard 
          title="Approval Rate" 
          value="98%" 
          trend="up" 
          icon={<CheckCircle size={20} />} 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Active Tasks List */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-900">My Active Tasks</h2>
             <NavLink to="/my-tasks" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</NavLink>
          </div>
          <div className="p-6 space-y-4">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                 <img src={`https://picsum.photos/seed/task${i}/200`} alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-semibold text-slate-900">Tech Gadget Review #{i}</h3>
                       <p className="text-sm text-slate-500">TechNova Inc.</p>
                     </div>
                     <span className="px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 flex items-center gap-1">
                       <Clock size={12} /> Due in 2d
                     </span>
                   </div>
                   <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                     <span className="flex items-center gap-1"><Video size={14} /> 1 Video Required</span>
                     <span className="font-medium text-emerald-600">Potential: $500</span>
                   </div>
                 </div>
                 <button className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
                   Submit Content
                 </button>
               </div>
             ))}
          </div>
        </div>
        
        {/* Recommended Campaigns */}
        <div className="w-full lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h2 className="text-lg font-bold text-slate-900 mb-4">Recommended for You</h2>
           <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative h-32 mb-2 overflow-hidden rounded-lg">
                    <img 
                      src={`https://picsum.photos/seed/rec${i}/400/200`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt="Campaign" 
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-900 shadow-sm">
                      Top Pick
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Summer Fashion Haul</h3>
                  <p className="text-xs text-slate-500 mb-2">UrbanStyle • Up to $1,200</p>
                  <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
           </div>
           <NavLink to="/browse" className="block mt-6 text-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
             Browse More Campaigns
           </NavLink>
        </div>
      </div>
    </div>
  );
};
