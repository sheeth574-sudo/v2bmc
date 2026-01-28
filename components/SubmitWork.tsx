import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useUser } from '../contexts/UserContext';
import { ChevronLeft, Video, CheckCircle, Clock, Link as LinkIcon, ThumbsUp, Eye, Calendar, ExternalLink, Key, AlertCircle } from 'lucide-react';
import { Submission } from '../types';

export const SubmitWork: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaign, updateCampaign } = useCampaigns();
  const { user } = useUser();
  const campaign = getCampaign(id || '');

  const [link, setLink] = useState('');
  const [sparkAdsCode, setSparkAdsCode] = useState('');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!campaign) return <div>Campaign not found</div>;
  if (!user) return <div>Please log in</div>;

  // Get ALL submissions for this user, not just one
  const mySubmissions = campaign.submissionList?.filter(s => s.creatorId === user.id) || [];

  const handleSubmit = () => {
    if (!link) return;

    // Check for duplicate link
    const isDuplicate = mySubmissions.some(s => s.link.trim() === link.trim());
    if (isDuplicate) {
      setError('You have already submitted this video link.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const newSubmission: Submission = {
        id: `sub-${user.id}-${Date.now()}`,
        creatorId: user.id,
        creatorName: user.name,
        avatar: user.avatar,
        link: link,
        sparkAdsCode: sparkAdsCode,
        views: views || '0',
        likes: likes || '0',
        status: 'pending',
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`, // Mock 16:9 thumb
        submittedAt: new Date().toISOString().split('T')[0]
      };

      // Always ADD new submission, don't replace
      const currentList = campaign.submissionList || [];
      const newList = [...currentList, newSubmission];

      updateCampaign(campaign.id, {
        submissionList: newList,
        kpi: { ...campaign.kpi!, submissions: (campaign.kpi?.submissions || 0) + 1 }
      });
      setIsSubmitting(false);
      
      // Reset form
      setLink('');
      setSparkAdsCode('');
      setViews('');
      setLikes('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/my-tasks')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
           <ChevronLeft />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Submit Work</h1>
           <p className="text-slate-500">{campaign.title} • {campaign.brandName}</p>
        </div>
      </div>

      {/* Top: New Submission Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <Video size={20} className="text-indigo-600" /> 
             New Submission
           </h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Form Inputs */}
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Video Link (TikTok/IG/YouTube)</label>
                <div className="relative">
                   <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                    type="text" 
                    placeholder="https://tiktok.com/@user/video/..."
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 outline-none ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      setError(''); // Clear error when typing
                    }}
                   />
                </div>
                {error && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">TikTok Spark Ads Code (Optional)</label>
                <div className="relative">
                   <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                    type="text" 
                    placeholder="e.g. A1B2C3D4E5"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    value={sparkAdsCode}
                    onChange={(e) => setSparkAdsCode(e.target.value)}
                   />
                </div>
                <p className="text-xs text-slate-500 mt-1">Provide this code if you allow the brand to boost your post.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Views</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Likes</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                 <textarea 
                   className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                   placeholder="Any additional info for the brand..."
                 />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!link || isSubmitting}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Submit Work'}
              </button>
           </div>

           {/* Preview Mockup */}
           <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-slate-200 border-dashed">
              {link ? (
                 <div className="w-full max-w-xs bg-white rounded-lg shadow-sm overflow-hidden border border-slate-100">
                    <div className="h-40 bg-slate-200 relative">
                       <img src={`https://picsum.photos/seed/${link}/400/225`} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center backdrop-blur">
                            <Video className="text-slate-900" size={20} />
                          </div>
                       </div>
                    </div>
                    <div className="p-3 text-left">
                       <p className="text-xs text-indigo-600 font-medium mb-1">TikTok</p>
                       <p className="text-sm font-bold text-slate-900 line-clamp-2">{link}</p>
                       <div className="flex gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Eye size={12}/> {views || 0}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={12}/> {likes || 0}</span>
                       </div>
                    </div>
                 </div>
              ) : (
                <div className="text-slate-400">
                   <Video size={48} className="mx-auto mb-2 opacity-50" />
                   <p className="text-sm font-medium">Link Preview</p>
                   <p className="text-xs">Paste a link to see preview</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Bottom: Submission History */}
      <div className="space-y-4">
         <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Submission History</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{mySubmissions.length}</span>
         </div>
         
         {mySubmissions.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
               No submissions yet. Use the form above to submit your work.
            </div>
         ) : (
            <div className="space-y-4">
              {[...mySubmissions].reverse().map((sub) => (
                <div key={sub.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-48 h-28 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img src={sub.thumbnail} className="w-full h-full object-cover" alt="" />
                  </div>
                  
                  <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                            <a href={sub.link} target="_blank" className="font-bold text-indigo-600 hover:underline flex items-center gap-1">
                              {sub.link} <ExternalLink size={12}/>
                            </a>
                            <p className="text-xs text-slate-500 mt-1">Submitted on {sub.submittedAt}</p>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${
                            sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {sub.status === 'approved' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                            {sub.status}
                        </span>
                      </div>

                      {/* Spark Ads Code Display */}
                      {sub.sparkAdsCode && (
                        <div className="mt-3 inline-block bg-slate-50 border border-slate-200 rounded px-2 py-1">
                            <span className="text-xs text-slate-500 font-medium uppercase mr-2">Spark Ads Code:</span>
                            <span className="text-sm font-mono text-slate-700">{sub.sparkAdsCode}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-xs text-slate-500 uppercase">Views</span>
                            <span className="font-bold text-slate-900">{sub.views}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-xs text-slate-500 uppercase">Likes</span>
                            <span className="font-bold text-slate-900">{sub.likes}</span>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
};