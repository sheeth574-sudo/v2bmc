import React, { useState } from 'react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useUser } from '../contexts/UserContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, ChevronRight, PlayCircle, AlertCircle, Video, DollarSign, Plus, LayoutList } from 'lucide-react';
import { Campaign } from '../types';

export const MyTasks: React.FC = () => {
  const { campaigns } = useCampaigns();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  if (!user) return <div>Please log in</div>;

  // Filter campaigns where creator is approved (Joined)
  const myCampaigns = campaigns.filter(c => 
    c.applicantList?.some(a => a.id.startsWith(user.id) && a.status === 'approved')
  );

  // Split based on Campaign Status (Not user submission status)
  // Active = Campaign is running or upcoming
  const activeTasks = myCampaigns.filter(c => c.status !== 'completed');
  // Completed = Campaign is finished
  const completedTasks = myCampaigns.filter(c => c.status === 'completed');

  const tasks = activeTab === 'active' ? activeTasks : completedTasks;

  const getSubmissionStatus = (campaign: Campaign) => {
    const mySubmissions = campaign.submissionList?.filter(s => s.creatorId === user.id) || [];
    const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;
    const approvedCount = mySubmissions.filter(s => s.status === 'approved').length;
    const rejectedCount = mySubmissions.filter(s => s.status === 'rejected').length;

    if (mySubmissions.length === 0) return (
        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">No submissions yet</span>
    );

    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 font-medium">
            <Clock size={12} /> {pendingCount} Under Review
          </span>
        )}
        {approvedCount > 0 && (
          <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 font-medium">
             <CheckCircle size={12} /> {approvedCount} Approved
          </span>
        )}
        {rejectedCount > 0 && (
          <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 font-medium">
             <AlertCircle size={12} /> {rejectedCount} Rejected
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
           <p className="text-slate-500 text-sm">Manage your active campaigns and submissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex overflow-x-auto w-fit">
        {[
          { id: 'active', label: 'Active Campaigns', count: activeTasks.length },
          { id: 'completed', label: 'Past Campaigns', count: completedTasks.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[140px] ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               {activeTab === 'active' ? <Video size={32} /> : <LayoutList size={32} />}
            </div>
            <h3 className="text-lg font-medium text-slate-900">No {activeTab} campaigns found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {activeTab === 'active' ? "You haven't joined any active campaigns yet." : "No completed campaigns history."}
            </p>
            {activeTab === 'active' && (
               <NavLink to="/browse" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                 Find Campaigns
               </NavLink>
            )}
          </div>
        ) : (
          tasks.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-center group">
               <div className="relative w-full md:w-48 h-32 md:h-28 rounded-lg overflow-hidden shrink-0">
                 <img src={campaign.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                 <div className={`absolute top-2 right-2 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${campaign.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                    {campaign.status}
                 </div>
               </div>
               
               <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                     <div>
                       <h3 className="font-bold text-slate-900 text-lg">{campaign.title}</h3>
                       <p className="text-sm text-slate-500">{campaign.brandName}</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 my-3">
                     <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-slate-600"><Calendar size={14}/> Ends: {campaign.endDate}</span>
                     <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-slate-600"><DollarSign size={14}/> Pool: ฿{campaign.totalBudget.toLocaleString()}</span>
                  </div>

                  {/* Dynamic Status Badges (Replaces the tabs) */}
                  <div className="mt-2">
                    {getSubmissionStatus(campaign)}
                  </div>
               </div>

               <div className="w-full md:w-auto flex flex-col gap-2 min-w-[150px]">
                 {activeTab === 'active' ? (
                   <>
                     <button 
                       onClick={() => navigate(`/submit/${campaign.id}`)}
                       className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm shadow-indigo-200"
                     >
                       <Plus size={16} /> Submit Work
                     </button>
                     <button 
                       onClick={() => navigate(`/browse/${campaign.id}`)}
                       className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                     >
                       View Requirements
                     </button>
                   </>
                 ) : (
                   <button 
                     onClick={() => navigate(`/submit/${campaign.id}`)}
                     className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                   >
                     View History
                   </button>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};