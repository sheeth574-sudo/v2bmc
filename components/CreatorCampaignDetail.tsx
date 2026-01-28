import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  Video, 
  UploadCloud, 
  Gift, 
  Trophy,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Check,
  FileText,
  Link as LinkIcon,
  Download,
  Box
} from 'lucide-react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useUser } from '../contexts/UserContext';
import { CampaignType, Applicant, Submission } from '../types';

export const CreatorCampaignDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaign, updateCampaign } = useCampaigns();
  const { user } = useUser();
  const campaign = getCampaign(id || '');

  const [wantsSample, setWantsSample] = useState(false);

  if (!campaign) return <div>Campaign not found</div>;
  if (!user) return <div>Please log in</div>;

  // Check status (Real-time synced with Context)
  const myApplicantRecord = campaign.applicantList?.find(a => a.id.startsWith(user.id));
  const isJoined = !!myApplicantRecord;
  const isApproved = myApplicantRecord?.status === 'approved';
  const isRejected = myApplicantRecord?.status === 'rejected';
  
  const handleJoin = () => {
    if (isJoined) return;

    if (wantsSample && !user.shippingAddress) {
       alert("Please update your shipping address in Settings before requesting a sample.");
       navigate('/settings');
       return;
    }

    const newApplicant: Applicant = {
      id: `${user.id}`, // Link directly to User ID for easy lookup
      name: user.name,
      avatar: user.avatar,
      platform: user.socialStats?.platform || 'TikTok',
      followers: user.socialStats?.followers || '0',
      status: 'pending', 
      appliedAt: new Date().toISOString().split('T')[0],
      requestSample: wantsSample,
      shippingAddress: wantsSample ? user.shippingAddress : undefined,
      sampleStatus: wantsSample ? 'pending' : undefined
    };

    updateCampaign(campaign.id, {
      applicantList: [...(campaign.applicantList || []), newApplicant],
      applicants: (campaign.applicants || 0) + 1,
    });
  };

  const getStepStatus = (step: number) => {
    // 1. Join
    // 2. Approval
    // 3. Submission
    if (step === 1) {
       return isJoined ? 'completed' : 'current';
    }
    if (step === 2) {
      if (isApproved) return 'completed';
      if (isRejected) return 'error';
      if (isJoined) return 'waiting';
      return 'upcoming';
    }
    if (step === 3) {
      // In this view, we only show step 3 as "Go to submission" if approved
      if (isApproved) return 'current';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      <button onClick={() => navigate('/browse')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft size={20} /> Back to Browse
      </button>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-md">
        <img src={campaign.coverImage} className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex flex-wrap gap-2 mb-3">
             {campaign.type.map(t => (
               <span key={t} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wide border border-white/30">
                 {t.replace('_', ' ')}
               </span>
             ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{campaign.title}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
             <span className="font-semibold">{campaign.brandName}</span>
             <span>•</span>
             <span className="flex items-center gap-1"><Calendar size={14}/> Ends {campaign.endDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="text-slate-500 text-xs uppercase font-bold mb-1">Total Prize Pool</div>
                <div className="text-xl md:text-2xl font-black text-emerald-600">฿{campaign.totalBudget.toLocaleString()}</div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="text-slate-500 text-xs uppercase font-bold mb-1">Applicants</div>
                <div className="text-xl md:text-2xl font-bold text-slate-900">{campaign.applicants}</div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <div className="text-slate-500 text-xs uppercase font-bold mb-1">Requirement</div>
                <div className="text-xl md:text-2xl font-bold text-slate-900">{campaign.requirements?.minFollowers ? `${campaign.requirements.minFollowers}+` : 'None'}</div>
             </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-xl font-bold text-slate-900 mb-4">About this Campaign</h2>
             <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
               {campaign.description}
             </p>

             <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Content Requirements</h3>
                <div className="space-y-3">
                   <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                      <p className="text-sm text-slate-600">Category: <span className="font-medium text-slate-900">{campaign.requirements?.category || 'Any'}</span></p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                      <p className="text-sm text-slate-600">Include Hashtags: <span className="font-medium text-slate-900">{campaign.requirements?.hashtag || '#Ad'}</span></p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                      <p className="text-sm text-slate-600">Product Link: <a href={campaign.requirements?.productLink} target="_blank" className="text-indigo-600 hover:underline">{campaign.requirements?.productLink}</a></p>
                   </div>
                </div>
             </div>
          </div>

          {/* Rewards */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Reward Tiers
            </h2>
            
            <div className="space-y-6">
              {campaign.rewardTiers.length === 0 ? (
                <p className="text-slate-500 italic">No specific tiers defined. Rewards based on performance.</p>
              ) : (
                campaign.rewardTiers.map((tier) => (
                  <div key={tier.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm mr-4">
                       {tier.tierType === CampaignType.GMV ? '💰' : tier.tierType === CampaignType.CONTENT_VOLUME ? '📹' : '🎁'}
                     </div>
                     <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                           <span className="font-bold text-slate-900">{tier.condition}</span>
                           <span className="hidden md:inline text-slate-300">•</span>
                           <span className="text-sm text-slate-500">{tier.description}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">{tier.tierType}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-lg font-black text-emerald-600">฿{tier.amount.toLocaleString()}</div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Action Box */}
            <div className={`bg-white p-6 rounded-2xl border ${isRejected ? 'border-red-200' : 'border-slate-200'} shadow-lg shadow-indigo-100`}>
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 {isApproved ? <CheckCircle className="text-green-500" /> : isRejected ? <AlertCircle className="text-red-500" /> : <Clock className="text-amber-500" />}
                 Your Status
               </h3>

               {/* Timeline */}
               <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 mb-8">
                  {/* Step 1: Join */}
                  <div className="relative">
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${getStepStatus(1) === 'completed' ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}></div>
                     <p className={`text-sm font-medium ${getStepStatus(1) === 'completed' ? 'text-slate-900' : 'text-slate-500'}`}>Join Campaign</p>
                  </div>

                  {/* Step 2: Approval */}
                  <div className="relative">
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                        getStepStatus(2) === 'completed' ? 'bg-green-500 border-green-500' : 
                        getStepStatus(2) === 'waiting' ? 'bg-amber-400 border-amber-400' : 
                        getStepStatus(2) === 'error' ? 'bg-red-500 border-red-500' :
                        'bg-white border-slate-300'
                      }`}></div>
                     <p className={`text-sm font-medium ${getStepStatus(2) === 'completed' ? 'text-slate-900' : getStepStatus(2) === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
                        {getStepStatus(2) === 'completed' ? 'Application Approved' : 
                         getStepStatus(2) === 'error' ? 'Application Rejected' : 
                         'Wait for Approval'}
                     </p>
                     {getStepStatus(2) === 'waiting' && <span className="text-xs text-amber-500 block mt-1 animate-pulse">Pending Review...</span>}
                  </div>

                   {/* Step 3: Submit Content */}
                   <div className="relative">
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                       getStepStatus(3) === 'completed' ? 'bg-green-500 border-green-500' : 
                       getStepStatus(3) === 'current' ? 'bg-white border-indigo-600 ring-4 ring-indigo-50' :
                       'bg-white border-slate-300'
                     }`}></div>
                     <p className={`text-sm font-medium ${
                       getStepStatus(3) === 'completed' ? 'text-slate-900' : 
                       getStepStatus(3) === 'current' ? 'text-indigo-700 font-bold' :
                       'text-slate-500'
                     }`}>Submit Content</p>
                  </div>
               </div>

               {/* Button Logic */}
               {!isJoined ? (
                 <div className="space-y-4">
                   <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer border border-slate-200 hover:border-indigo-200 transition-colors">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={wantsSample}
                          onChange={(e) => setWantsSample(e.target.checked)}
                          className="w-5 h-5 border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        />
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-slate-800 flex items-center gap-1"><Box size={14}/> Request Free Sample</span>
                        <p className="text-xs text-slate-500 mt-1">
                          Product will be sent to your profile address: <br/>
                          <span className="font-medium text-slate-700">{user.shippingAddress || 'No Address Set (Set in Settings)'}</span>
                        </p>
                      </div>
                   </label>

                   <button 
                    onClick={handleJoin}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform active:scale-95"
                   >
                     Join Campaign Now
                   </button>
                 </div>
               ) : isRejected ? (
                 <div className="p-4 bg-red-50 text-red-800 text-sm rounded-lg text-center font-medium border border-red-100">
                   Your application was declined by the brand.
                 </div>
               ) : !isApproved ? (
                 <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg text-center font-medium">
                   Application Under Review
                   {myApplicantRecord?.requestSample && (
                     <p className="text-xs text-amber-700 mt-1 flex items-center justify-center gap-1">
                       <Box size={12}/> Sample Requested
                       {myApplicantRecord.sampleStatus === 'sent' && <span className="text-green-600 font-bold ml-1">(Sent)</span>}
                     </p>
                   )}
                 </div>
               ) : (
                 <div className="space-y-3">
                    <div className="p-3 bg-green-50 text-green-800 text-sm rounded-lg text-center font-medium border border-green-100 flex items-center justify-center gap-2">
                       <CheckCircle size={16}/> Application Approved!
                    </div>
                    <button 
                      onClick={() => navigate(`/submit/${campaign.id}`)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Video size={18} /> Submit Work
                    </button>
                    <button 
                      onClick={() => navigate('/my-tasks')}
                      className="w-full py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
                    >
                      Go to My Tasks
                    </button>
                 </div>
               )}
            </div>

             {/* Resources Card (Dynamic) */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Resources</h3>
                <div className="space-y-2">
                   {!campaign.resources || campaign.resources.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No resources provided.</p>
                   ) : (
                     campaign.resources.map(res => (
                       <a 
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-sm text-slate-600 transition-colors border border-transparent hover:border-slate-200 group"
                       >
                          <span className="flex items-center gap-2">
                            {res.type === 'file' ? <FileText size={16} /> : res.type === 'image' ? <UploadCloud size={16} /> : <LinkIcon size={16} />}
                            <span className="font-medium group-hover:text-indigo-600 transition-colors">{res.title}</span>
                          </span>
                          {res.type === 'file' ? <Download size={14} /> : <ExternalLink size={14} />}
                       </a>
                     ))
                   )}
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};