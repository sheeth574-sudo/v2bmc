import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, DollarSign, ChevronLeft, CheckCircle, XCircle, 
  Video, ExternalLink, Smartphone, FileText, Download, Link as LinkIcon,
  ChevronDown, ChevronUp, Box, PlayCircle, ThumbsUp, Eye, Trophy, AlertCircle,
  Medal, Crown, TrendingUp, UploadCloud, FileSpreadsheet, Loader2, RefreshCw,
  BarChart2, ArrowUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCampaigns } from '../contexts/CampaignContext';
import { CampaignType, Submission } from '../types';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaign, updateCampaign } = useCampaigns();
  const campaign = getCampaign(id || '');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'applicants' | 'submissions' | 'rewards'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Today, 09:00 AM');
  
  // Mock Chart Data State
  const [chartData, setChartData] = useState([
    { name: 'Mon', views: 2400 },
    { name: 'Tue', views: 1398 },
    { name: 'Wed', views: 9800 },
    { name: 'Thu', views: 3908 },
    { name: 'Fri', views: 4800 },
    { name: 'Sat', views: 3800 },
    { name: 'Sun', views: 4300 },
  ]);
  
  // State for Accordion (Expanded Creators)
  const [expandedCreators, setExpandedCreators] = useState<string[]>([]);

  // Initialize expanded state when submissions load
  useEffect(() => {
    if (campaign?.submissionList) {
      const allCreatorIds = Array.from(new Set(campaign.submissionList.map(s => s.creatorId)));
      setExpandedCreators(allCreatorIds);
    }
  }, [campaign?.submissionList?.length]);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-slate-900">Campaign not found</h2>
        <button onClick={() => navigate('/campaigns')} className="mt-4 text-indigo-600 hover:underline">
          Back to Campaigns
        </button>
      </div>
    );
  }

  // --- 1. Helper to Parse Metrics ---
  const parseMetric = (val: string) => {
    if (typeof val === 'string') {
        if(val.includes('K')) return parseFloat(val) * 1000;
        if(val.includes('M')) return parseFloat(val) * 1000000;
        return parseInt(val.replace(/,/g, '')) || 0;
    }
    return val || 0;
  };

  // --- 2. Calculate Leaderboard & Payouts (Real-time) ---
  const leaderboard = useMemo(() => {
    const creatorStats = Object.values(
      (campaign.submissionList || []).reduce((acc, sub) => {
        if (!acc[sub.creatorId]) {
          acc[sub.creatorId] = {
            id: sub.creatorId,
            name: sub.creatorName,
            avatar: sub.avatar,
            totalViews: 0,
            totalLikes: 0,
            videoCount: 0,
            approvedCount: 0
          };
        }
        
        acc[sub.creatorId].totalViews += parseMetric(sub.views);
        acc[sub.creatorId].totalLikes += parseMetric(sub.likes);
        acc[sub.creatorId].videoCount += 1;
        if (sub.status === 'approved') acc[sub.creatorId].approvedCount += 1;
        return acc;
      }, {} as Record<string, any>)
    );

    creatorStats.sort((a, b) => b.totalViews - a.totalViews);

    return creatorStats.map((creator, index) => {
       const rank = index + 1;
       const tier = campaign.rewardTiers.find(t => 
         rank >= (t.rankStart || 0) && rank <= (t.rankEnd || 9999)
       );
       
       return {
         ...creator,
         rank,
         rewardAmount: tier ? tier.amount : 0,
         tierName: tier ? tier.description : '-'
       };
    });
  }, [campaign.submissionList, campaign.rewardTiers]);

  const projectedPayout = leaderboard.reduce((sum, item) => sum + item.rewardAmount, 0);

  // --- 3. Data Import Simulation ---
  const handleSimulateImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      // 1. Simulate reading a CSV by boosting views/likes randomly
      const updatedSubmissions = (campaign.submissionList || []).map(sub => {
         const currentViews = parseMetric(sub.views);
         const currentLikes = parseMetric(sub.likes);
         
         const viewBoost = Math.floor(Math.random() * 15000) + 2000; // Big boost to see graph jump
         const likeBoost = Math.floor(viewBoost * 0.1);

         return {
           ...sub,
           views: (currentViews + viewBoost).toLocaleString(),
           likes: (currentLikes + likeBoost).toLocaleString()
         };
      });

      // 2. Recalculate KPI totals
      const totalViews = updatedSubmissions.reduce((acc, s) => acc + parseMetric(s.views), 0);
      
      updateCampaign(campaign.id, { 
        submissionList: updatedSubmissions,
        kpi: {
            ...campaign.kpi!,
            totalViews: totalViews > 1000000 ? (totalViews/1000000).toFixed(1) + 'M' : (totalViews/1000).toFixed(1) + 'K'
        }
      });

      // 3. Update Chart Data to show the "Spike"
      const newDay = { name: 'Today', views: Math.floor(totalViews / 10) }; // Simplified logic for chart
      // Add new data point or boost last one
      setChartData(prev => {
        const newData = [...prev];
        newData[newData.length - 1].views += 5000; // Visual boost
        return newData;
      });

      setLastUpdated('Just now');
      setIsImporting(false);
      setShowImportModal(false);
    }, 1500);
  };

  // --- Group Submissions by Creator ---
  const submissionsByCreator = useMemo(() => {
    const groups: Record<string, { creator: Submission, videos: Submission[] }> = {};
    (campaign.submissionList || []).forEach(sub => {
      if (filterStatus !== 'all' && sub.status !== filterStatus) return;
      if (!groups[sub.creatorId]) {
        groups[sub.creatorId] = { creator: sub, videos: [] };
      }
      groups[sub.creatorId].videos.push(sub);
    });
    return Object.values(groups);
  }, [campaign.submissionList, filterStatus]);


  // Actions
  const handleApplicantStatus = (applicantId: string, newStatus: 'approved' | 'rejected') => {
    const updatedList = (campaign.applicantList || []).map(a => 
      a.id === applicantId ? { ...a, status: newStatus } : a
    );
    updateCampaign(campaign.id, { applicantList: updatedList });
  };

  const handleSubmissionStatus = (submissionId: string, newStatus: 'approved' | 'rejected') => {
    const updatedList = (campaign.submissionList || []).map(s => 
      s.id === submissionId ? { ...s, status: newStatus } : s
    );
    updateCampaign(campaign.id, { submissionList: updatedList });
  };

  const handleBulkApprove = (creatorId: string) => {
    const updatedSubmissions = (campaign.submissionList || []).map(sub => {
       if (sub.creatorId === creatorId && sub.status === 'pending') return { ...sub, status: 'approved' as const };
       return sub;
    });
    updateCampaign(campaign.id, { submissionList: updatedSubmissions });
  };

  const toggleExpand = (creatorId: string) => {
    setExpandedCreators(prev => prev.includes(creatorId) ? prev.filter(id => id !== creatorId) : [...prev, creatorId]);
  };
  
  const filteredApplicants = (campaign.applicantList || []).filter(a => filterStatus === 'all' || a.status === filterStatus);

  const getTypeLabel = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return "Top Sales";
      case CampaignType.CONTENT_VOLUME: return "Content Vol";
      case CampaignType.LUCKY_DRAW: return "Lucky Draw";
      default: return type;
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return "🏆";
      case CampaignType.CONTENT_VOLUME: return "📹";
      case CampaignType.LUCKY_DRAW: return "🎲";
      default: return "★";
    }
  };

  return (
    <div className="animate-fade-in pb-12 relative">
      {/* Back Nav */}
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft size={20} /> Back to Campaigns
      </button>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Main Interface */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Header Card (Budget & KPI) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={16} /> {campaign.startDate} - {campaign.endDate}</span>
                  <span className="flex items-center gap-1"><DollarSign size={16} /> Budget: {campaign.totalBudget.toLocaleString()} THB</span>
                </div>
              </div>

              {/* PROJECTED PAYOUT (Budget Spent) */}
              <div className="text-right min-w-[180px]">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center justify-end gap-1">
                  Projected Payout 
                  <span title="Calculated based on current leaderboard positions" className="cursor-help">
                    <AlertCircle size={12} className="text-slate-400" />
                  </span>
                </p>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-700 ${projectedPayout > campaign.totalBudget ? 'bg-red-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${Math.min((projectedPayout / campaign.totalBudget) * 100, 100)}%` }}
                     ></div>
                  </div>
                  <span className={`font-bold ${projectedPayout > campaign.totalBudget ? 'text-red-600' : 'text-slate-900'}`}>
                     {Math.round((projectedPayout / campaign.totalBudget) * 100)}%
                  </span>
                </div>
                <p className={`text-xs mt-1 font-medium ${projectedPayout > campaign.totalBudget ? 'text-red-500' : 'text-slate-400'}`}>
                   ฿{projectedPayout.toLocaleString()} / ฿{campaign.totalBudget.toLocaleString()}
                </p>
              </div>
            </div>

            {/* KPI Cards (Always Visible) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
               <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Total Views</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.kpi?.totalViews || '0'}</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Engagement</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.kpi?.engagement || '0%'}</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Applicants</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.applicants}</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Submissions</p>
                  <p className="text-lg font-bold text-slate-900">{campaign.kpi?.submissions || 0}</p>
               </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-slate-200">
            <div className="flex gap-8 overflow-x-auto">
              {['overview', 'applicants', 'submissions', 'rewards'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setFilterStatus('all'); }}
                  className={`pb-4 px-2 text-sm font-bold capitalize transition-all relative whitespace-nowrap ${
                    activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
                  {tab === 'applicants' && (campaign.applicantList?.filter(a => a.status === 'pending').length || 0) > 0 && (
                    <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {campaign.applicantList?.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                  {tab === 'submissions' && (campaign.submissionList?.filter(s => s.status === 'pending').length || 0) > 0 && (
                     <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {campaign.submissionList?.filter(s => s.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}
          
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
                
                {/* PERFORMANCE OVERVIEW & IMPORT SECTION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <BarChart2 size={20} className="text-indigo-600"/> Performance Trends
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          Last updated: <span className="font-medium text-slate-700">{lastUpdated}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                      >
                        <UploadCloud size={16} /> Import Data
                      </button>
                   </div>
                   
                   <div className="p-6">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={20} className="text-slate-400"/> Campaign Brief</h3>
                      <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">{campaign.description}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-slate-400"/> Requirements</h3>
                      <div className="space-y-4">
                        <div><span className="text-xs text-slate-500 uppercase font-bold">Category</span><p className="font-medium text-slate-900">{campaign.requirements?.category || 'Any'}</p></div>
                        <div><span className="text-xs text-slate-500 uppercase font-bold">Min Followers</span><p className="font-medium text-slate-900">{campaign.requirements?.minFollowers?.toLocaleString() || 'None'}</p></div>
                        <div><span className="text-xs text-slate-500 uppercase font-bold">Hashtags</span><div className="flex flex-wrap gap-1 mt-1">{campaign.requirements?.hashtag ? campaign.requirements.hashtag.split(' ').map((tag, i) => <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{tag.startsWith('#') ? tag : `#${tag}`}</span>) : <span className="text-slate-400 text-sm">-</span>}</div></div>
                        <div><span className="text-xs text-slate-500 uppercase font-bold">Product Link</span><a href={campaign.requirements?.productLink} target="_blank" rel="noreferrer" className="block mt-1 text-sm text-indigo-600 hover:underline truncate">{campaign.requirements?.productLink || '-'}</a></div>
                      </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Download size={20} className="text-indigo-500"/> Campaign Assets & Guidelines</h3>
                    <div className="space-y-2">
                        {campaign.resources?.map(res => (
                          <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded group-hover:bg-indigo-100 transition-colors">{res.type === 'file' ? <FileText size={18} /> : <LinkIcon size={18} />}</div>
                                <div><p className="text-sm font-medium text-slate-900">{res.title}</p>{res.size && <p className="text-xs text-slate-500">{res.size}</p>}</div>
                            </div>
                            <button className="text-slate-400 hover:text-indigo-600 p-2"><Download size={18} /></button>
                          </div>
                        ))}
                        {(!campaign.resources || campaign.resources.length === 0) && <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg"><p className="text-sm text-slate-500 italic mb-2">No resources uploaded yet.</p></div>}
                    </div>
                </div>
            </div>
          )}

          {/* 2. Applicants Tab */}
          {activeTab === 'applicants' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Creator Applications</h3>
                  <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                      <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filterStatus === status ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{status}</button>
                    ))}
                  </div>
               </div>
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Creator</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Platform</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stats</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Requests</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredApplicants.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-500">No applicants found.</td></tr> : filteredApplicants.map(applicant => (
                         <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={applicant.avatar} className="w-10 h-10 rounded-full object-cover" alt=""/><div><div className="font-medium text-slate-900">{applicant.name}</div><div className="text-xs text-slate-400">Applied: {applicant.appliedAt}</div></div></div></td>
                           <td className="px-6 py-4 text-sm text-slate-600 capitalize">{applicant.platform}</td>
                           <td className="px-6 py-4 text-sm text-slate-600">{applicant.followers} Followers</td>
                           <td className="px-6 py-4 text-sm">{applicant.requestSample ? <div className="flex flex-col"><span className="text-indigo-600 font-bold text-xs flex items-center gap-1"><Box size={10}/> Sample</span><span className="text-[10px] text-slate-400 truncate max-w-[100px]">{applicant.shippingAddress}</span></div> : <span className="text-slate-400 text-xs">-</span>}</td>
                           <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${applicant.status === 'approved' ? 'bg-green-100 text-green-700' : applicant.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{applicant.status}</span></td>
                           <td className="px-6 py-4 text-right">{applicant.status === 'pending' && <div className="flex justify-end gap-2"><button onClick={() => handleApplicantStatus(applicant.id, 'approved')} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"><CheckCircle size={18}/></button><button onClick={() => handleApplicantStatus(applicant.id, 'rejected')} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"><XCircle size={18}/></button></div>}</td>
                         </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* 3. Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-bold text-slate-900">Content Submissions</h3>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                      <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filterStatus === status ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{status}</button>
                    ))}
                  </div>
               </div>

               {submissionsByCreator.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">No submissions found.</div>
               ) : (
                 <div className="space-y-4">
                   {submissionsByCreator.map(({ creator, videos }) => {
                     const isExpanded = expandedCreators.includes(creator.creatorId);
                     const pendingCount = videos.filter(v => v.status === 'pending').length;
                     return (
                      <div key={creator.creatorId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200">
                         <div onClick={() => toggleExpand(creator.creatorId)} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors select-none">
                            <div className="flex items-center gap-4">
                              <div className="relative"><img src={creator.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt=""/></div>
                              <div><h4 className="font-bold text-slate-900">{creator.creatorName}</h4><div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Video size={12}/> {videos.length} Videos</span>{pendingCount > 0 && <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">{pendingCount} Pending Review</span>}</div></div>
                            </div>
                            <div className="flex items-center gap-3 self-end sm:self-center">{pendingCount > 0 && <button onClick={(e) => { e.stopPropagation(); handleBulkApprove(creator.creatorId); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all z-10">Approve All</button>}<div className={`p-2 rounded-full text-slate-400 bg-slate-50 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={20} /></div></div>
                         </div>
                         {isExpanded && (
                           <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {videos.map(submission => (
                                  <div key={submission.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3">
                                      <div className="w-32 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative group"><img src={submission.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" /><a href={submission.link} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}><PlayCircle className="text-white drop-shadow-md" size={24} /></a></div>
                                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                                          <div>
                                            <div className="flex justify-between items-start"><a href={submission.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate block max-w-[120px]">{submission.link}</a><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${submission.status === 'approved' ? 'bg-green-100 text-green-700' : submission.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{submission.status}</span></div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1"><span className="flex items-center gap-1"><Eye size={10}/> {submission.views}</span><span className="flex items-center gap-1"><ThumbsUp size={10}/> {submission.likes}</span></div>
                                          </div>
                                          {submission.status === 'pending' && <div className="flex gap-2 mt-2"><button onClick={() => handleSubmissionStatus(submission.id, 'approved')} className="flex-1 py-1 bg-green-50 text-green-700 border border-green-100 rounded text-[10px] font-bold hover:bg-green-100 transition-colors">Approve</button><button onClick={() => handleSubmissionStatus(submission.id, 'rejected')} className="flex-1 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-bold hover:bg-red-100 transition-colors">Reject</button></div>}
                                      </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                         )}
                      </div>
                     );
                   })}
                 </div>
               )}
            </div>
          )}

          {/* 4. Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-600"/> Live Leaderboard & Payouts</h3>
                      <p className="text-xs text-slate-500 mt-1">Real-time ranking based on submission performance</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-slate-500 uppercase font-bold">Projected Payout</p>
                       <p className="text-xl font-black text-emerald-600">฿{projectedPayout.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white border-b border-slate-200">
                        <tr><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rank</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Creator</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Videos</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Total Views</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Projected Reward</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboard.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-slate-400">No data available yet.</td></tr> : leaderboard.map((item) => (
                             <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.rank <= 3 ? 'bg-indigo-50/10' : ''}`}>
                               <td className="px-6 py-4"><div className="flex items-center gap-2">{item.rank === 1 && <Crown size={18} className="text-yellow-500 fill-yellow-500"/>}{item.rank === 2 && <Medal size={18} className="text-slate-400 fill-slate-400"/>}{item.rank === 3 && <Medal size={18} className="text-amber-700 fill-amber-700"/>}<span className={`font-bold ${item.rank <= 3 ? 'text-slate-900' : 'text-slate-500'}`}>#{item.rank}</span></div></td>
                               <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={item.avatar} className="w-8 h-8 rounded-full object-cover" alt=""/><div className="font-medium text-slate-900">{item.name}</div></div></td>
                               <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{item.videoCount}</span></td>
                               <td className="px-6 py-4 text-right font-mono text-slate-700">{item.totalViews.toLocaleString()}</td>
                               <td className="px-6 py-4 text-right">{item.rewardAmount > 0 ? <div><span className="font-bold text-emerald-600">฿{item.rewardAmount.toLocaleString()}</span><p className="text-[10px] text-slate-400">{item.tierName}</p></div> : <span className="text-slate-300 text-xs">-</span>}</td>
                             </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Trophy size={20} className="text-amber-500"/> Reward Structure Configuration</h3><div className="text-right"><span className="text-xs text-slate-500 uppercase font-bold mr-2">Total Pool</span><span className="text-xl font-black text-emerald-600">฿{campaign.totalBudget.toLocaleString()}</span></div></div>
                  {campaign.rewardTiers.length === 0 ? <p className="text-slate-400 text-center py-4 italic">No reward tiers configured.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...new Set(campaign.rewardTiers.map(t => t.tierType))].map(type => (<div key={type} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50"><h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">{getTypeIcon(type as CampaignType)} {getTypeLabel(type as CampaignType)}</h4><div className="space-y-2">{campaign.rewardTiers.filter(t => t.tierType === type).map(tier => (<div key={tier.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm"><div><div className="font-bold text-slate-900 text-sm">{tier.condition}</div><div className="text-xs text-slate-500">{tier.description}</div></div><div className="text-emerald-600 font-bold">฿{tier.amount.toLocaleString()}</div></div>))}</div></div>))}</div>}
                </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Smartphone Preview */}
        <div className="hidden xl:block w-[380px] shrink-0">
          {/* ... existing smartphone preview code ... */}
           <div className="sticky top-24">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <Smartphone size={16} /> Creator View Simulation
              </h3>
            </div>
            <div className="bg-white border-[8px] border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl h-[720px] relative">
              <div className="absolute top-0 left-0 right-0 h-7 bg-slate-900 z-10 flex justify-center"><div className="w-24 h-5 bg-black rounded-b-xl"></div></div>
              <div className="h-full overflow-y-auto bg-slate-50 scrollbar-hide pb-8">
                <div className="h-48 bg-slate-200 relative"><img src={campaign.coverImage} className="w-full h-full object-cover" alt="Cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div className="absolute bottom-4 left-4 right-4 text-white"><div className="flex gap-2 mb-2">{campaign.type.slice(0, 2).map(t => (<span key={t} className="px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[10px] font-bold uppercase">{getTypeLabel(t)}</span>))}</div><h3 className="font-bold text-lg leading-tight mb-1">{campaign.title}</h3><p className="text-xs opacity-90">{campaign.brandName}</p></div></div>
                <div className="p-4 space-y-4 -mt-4 relative z-10">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center"><p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Total Prize Pool</p><p className="text-2xl font-black text-emerald-600">{campaign.totalBudget.toLocaleString()} THB</p></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide border-b border-slate-50 pb-2">Reward Tiers</h4><div className="space-y-4">{campaign.rewardTiers.length === 0 ? <p className="text-xs text-slate-400 italic text-center">No tiers configured.</p> : [...new Set(campaign.rewardTiers.map(t => t.tierType))].map(type => (<div key={type}><h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1">{getTypeIcon(type as CampaignType)} {getTypeLabel(type as CampaignType)}</h5><div className="space-y-2">{campaign.rewardTiers.filter(t => t.tierType === type).map((tier, i) => (<div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100"><div><div className="text-xs font-bold text-slate-700">{tier.condition}</div><div className="text-[10px] text-slate-500">{tier.description}</div></div><span className="text-xs font-bold text-emerald-600">฿{tier.amount.toLocaleString()}</span></div>))}</div></div>))}</div></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Brief Info</h4><p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{campaign.description}</p><button className="text-xs text-indigo-600 font-bold mt-2">Read More</button></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Requirements</h4><div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-slate-50 p-2 rounded"><span className="block text-slate-400">Min. Followers</span><span className="font-semibold text-slate-700">{campaign.requirements?.minFollowers?.toLocaleString() || 'Any'}</span></div><div className="bg-slate-50 p-2 rounded"><span className="block text-slate-400">Category</span><span className="font-semibold text-slate-700">{campaign.requirements?.category || 'Any'}</span></div></div></div>
                </div>
                <div className="p-4 mt-2"><button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Join Campaign</button></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <UploadCloud className="text-emerald-600"/> Import Performance Data
               </h3>
               <p className="text-sm text-slate-500 mt-1">Upload a CSV/Excel file from TikTok Affiliate Center to update campaign stats.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-emerald-200 transition-colors cursor-pointer group">
                 <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <FileSpreadsheet className="text-emerald-600" size={24} />
                 </div>
                 <p className="text-sm font-bold text-slate-700">Click to upload file</p>
                 <p className="text-xs text-slate-400 mt-1">or drag and drop .csv, .xlsx</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Simulated Data Preview</h4>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs">
                     <span className="text-slate-600">Total Records:</span>
                     <span className="font-mono font-bold text-slate-900">{campaign.submissionList?.length || 0} Rows</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-slate-600">Est. Total Views Update:</span>
                     <span className="font-mono font-bold text-green-600">+1.2M</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <button 
                 onClick={() => setShowImportModal(false)}
                 className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg text-sm"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSimulateImport}
                 disabled={isImporting}
                 className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
               >
                 {isImporting ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                 {isImporting ? 'Processing...' : 'Confirm Import'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};