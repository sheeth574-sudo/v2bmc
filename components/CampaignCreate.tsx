import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignType, RewardTier, Campaign } from '../types';
import { Sparkles, Loader2, Plus, Trash2, Smartphone, Check, Image as ImageIcon, Calendar, AlertCircle } from 'lucide-react';
import { suggestBudgetAllocation } from '../services/geminiService';
import { useCampaigns } from '../contexts/CampaignContext';
import { useUser } from '../contexts/UserContext';

export const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const { user } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<CampaignType[]>([CampaignType.GMV]);
  
  const [formData, setFormData] = useState({
    title: '',
    brandName: '',
    totalBudget: 50000,
    description: '',
    startDate: '',
    endDate: '',
    minFollowers: '',
    category: '',
    hashtag: '',
    productLink: ''
  });
  
  const [tiers, setTiers] = useState<RewardTier[]>([
    { id: '1', tierType: CampaignType.GMV, rankStart: 1, rankEnd: 1, condition: 'Rank 1', amount: 15000, description: 'Gold Prize' },
    { id: '2', tierType: CampaignType.GMV, rankStart: 2, rankEnd: 5, condition: 'Rank 2-5', amount: 5000, description: 'Silver Prize' }
  ]);

  // Calculate Used Budget
  const usedBudget = useMemo(() => {
    return tiers.reduce((acc, tier) => {
      // If user hasn't typed a rank, assume 1 person
      const start = tier.rankStart || 0;
      const end = tier.rankEnd || 0;
      const count = Math.max(1, end - start + 1);
      return acc + (tier.amount * count);
    }, 0);
  }, [tiers]);

  const remainingBudget = formData.totalBudget - usedBudget;
  const isOverBudget = remainingBudget < 0;

  const toggleType = (type: CampaignType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleAIAllocate = async () => {
    if (!formData.totalBudget) {
      alert("Please enter a total budget first.");
      return;
    }
    
    setLoading(true);
    // Pass existing tiers so AI respects the user's structure
    const updatedTiers = await suggestBudgetAllocation(
      formData.totalBudget,
      selectedTypes,
      formData.description,
      tiers
    );
    setTiers(updatedTiers);
    setLoading(false);
  };

  const addTier = (type: CampaignType) => {
    const existingTiers = tiers.filter(t => t.tierType === type);
    const lastRankEnd = existingTiers.length > 0 
      ? Math.max(...existingTiers.map(t => t.rankEnd || 0)) 
      : 0;
    const nextRank = lastRankEnd + 1;

    setTiers([...tiers, { 
      id: Date.now().toString(), 
      tierType: type, 
      rankStart: nextRank, 
      rankEnd: nextRank, 
      condition: '', 
      amount: 0,
      description: '' 
    }]);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  const updateTier = (id: string, field: keyof RewardTier, value: any) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleCreate = () => {
    // Validation
    if (!formData.title || !formData.brandName || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (selectedTypes.length === 0) {
      alert("Please select at least one campaign type.");
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(), // Simple ID generation
      title: formData.title,
      brandName: formData.brandName,
      brandId: user?.id || 'brand-1', // Fallback if no user context
      type: selectedTypes,
      status: 'active', // Default to active for demo purposes
      totalBudget: formData.totalBudget,
      spent: 0,
      applicants: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      coverImage: `https://picsum.photos/seed/${Date.now()}/400/300`, // Random image
      rewardTiers: tiers,
      requirements: {
        minFollowers: formData.minFollowers ? Number(formData.minFollowers) : undefined,
        category: formData.category,
        hashtag: formData.hashtag,
        productLink: formData.productLink
      },
      // Initialize empty KPI data for the detail view
      kpi: {
        creators: 0,
        submissions: 0,
        totalViews: '0',
        engagement: '0%'
      }
    };

    addCampaign(newCampaign);
    navigate('/campaigns');
  };

  const getTypeLabel = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return "Top Sales (GMV)";
      case CampaignType.CONTENT_VOLUME: return "Content Volume (Most Videos)";
      case CampaignType.LUCKY_DRAW: return "Lucky Draw (Random)";
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return "🏆";
      case CampaignType.CONTENT_VOLUME: return "📹";
      case CampaignType.LUCKY_DRAW: return "🎲";
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start animate-fade-in">
      {/* Left: Form */}
      <div className="flex-1 w-full space-y-8 pb-12">
        
        {/* Section 1: Campaign Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">1. Campaign Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Campaign Type (Select all that apply) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[CampaignType.GMV, CampaignType.CONTENT_VOLUME, CampaignType.LUCKY_DRAW].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTypes.includes(type)
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-600 bg-white'
                    }`}
                  >
                    {selectedTypes.includes(type) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="font-semibold text-sm">{getTypeLabel(type)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaign Cover Image <span className="text-red-500">*</span>
              </label>
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <p className="text-sm font-medium text-indigo-600">Upload a file <span className="text-slate-500">or drag and drop</span></p>
                <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Summer Sale Challenge"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brand / Shop Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. MyShop Official"
                  value={formData.brandName}
                  onChange={e => setFormData({...formData, brandName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description & Rules <span className="text-red-500">*</span>
              </label>
              <textarea 
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-colors"
                placeholder="Explain rules, required content type, and dos/don'ts..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                  <Calendar className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                  <Calendar className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Rewards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">2. Budget & Rewards</h2>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Prize Allocation</span>
              <span className="text-lg font-bold text-emerald-600">
                {formData.totalBudget.toLocaleString()} THB
              </span>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Total Prize Budget (THB) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <input 
                type="number" 
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                value={formData.totalBudget}
                onChange={e => setFormData({...formData, totalBudget: Number(e.target.value)})}
              />
              <button 
                onClick={handleAIAllocate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm transition-all disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                AI Auto-Allocate
              </button>
            </div>
            
            {/* Budget Usage Indicator */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Budget Usage</span>
                <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                  {usedBudget.toLocaleString()} / {formData.totalBudget.toLocaleString()} THB
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((usedBudget / formData.totalBudget) * 100, 100)}%` }}
                ></div>
              </div>
              {isOverBudget && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-600 font-medium">
                  <AlertCircle size={14} />
                  You have exceeded your budget by {(usedBudget - formData.totalBudget).toLocaleString()} THB
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {selectedTypes.length === 0 && (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Please select a campaign type above to configure rewards.
              </div>
            )}

            {selectedTypes.map(type => (
              <div key={type} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>{getTypeIcon(type)}</span>
                    {getTypeLabel(type).toUpperCase()} REWARDS
                  </h3>
                  <button 
                    onClick={() => addTier(type)}
                    className="text-xs flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 font-medium"
                  >
                    <Plus size={14} /> Add Tier
                  </button>
                </div>
                <div className="p-6 space-y-3">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    <div className="col-span-2">Rank From</div>
                    <div className="col-span-2">To</div>
                    <div className="col-span-3">Amount (Each)</div>
                    <div className="col-span-4">Note</div>
                    <div className="col-span-1"></div>
                  </div>

                  {tiers.filter(t => t.tierType === type).map((tier) => (
                    <div key={tier.id} className="grid grid-cols-12 gap-4 items-center group">
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          placeholder="1"
                          value={tier.rankStart || ''}
                          onChange={e => updateTier(tier.id, 'rankStart', Number(e.target.value))}
                          className="w-full bg-white text-sm border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          placeholder="1"
                          value={tier.rankEnd || ''}
                          onChange={e => updateTier(tier.id, 'rankEnd', Number(e.target.value))}
                          className="w-full bg-white text-sm border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number" 
                          placeholder="5000"
                          value={tier.amount}
                          onChange={e => updateTier(tier.id, 'amount', Number(e.target.value))}
                          className="w-full bg-white text-sm border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="col-span-4">
                        <input 
                          type="text" 
                          placeholder="e.g. Gift Set"
                          value={tier.description || ''}
                          onChange={e => updateTier(tier.id, 'description', e.target.value)}
                          className="w-full bg-white text-sm border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeTier(tier.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {tiers.filter(t => t.tierType === type).length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-2 italic">No tiers added yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Platform Fee (15%): <span className="font-bold">{(formData.totalBudget * 0.15).toLocaleString()} THB</span> (Paid on top of budget)
          </div>
        </div>

        {/* Section 3: Requirements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">3. Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min. Followers</label>
              <input 
                type="number" 
                placeholder="e.g. 1000"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                value={formData.minFollowers}
                onChange={e => setFormData({...formData, minFollowers: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Beauty, Skincare"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Required Hashtag</label>
              <input 
                type="text" 
                placeholder="#MyCampaign"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                value={formData.hashtag}
                onChange={e => setFormData({...formData, hashtag: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Main Product Link <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                value={formData.productLink}
                onChange={e => setFormData({...formData, productLink: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={() => navigate('/campaigns')}
            className="px-6 py-3 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-8 py-3 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 shadow-md transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="hidden xl:block w-[380px] shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-slate-500">Preview</h3>
            <Smartphone size={16} className="text-slate-400" />
          </div>
          <div className="bg-white border-[8px] border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl h-[720px] relative">
            <div className="absolute top-0 left-0 right-0 h-7 bg-slate-900 z-10 flex justify-center">
              <div className="w-24 h-5 bg-black rounded-b-xl"></div>
            </div>
            
            <div className="h-full overflow-y-auto bg-slate-50 scrollbar-hide pb-8">
              <div className="h-48 bg-indigo-600 relative">
                 {/* Placeholder for uploaded image */}
                 <img src={`https://picsum.photos/seed/preview/400/200`} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex gap-2 mb-2">
                    {selectedTypes.slice(0, 2).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[10px] font-bold uppercase">
                        {getTypeLabel(t).split(' ')[0]}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{formData.title || 'Campaign Title'}</h3>
                  <p className="text-xs opacity-90">{formData.brandName || 'Brand Name'}</p>
                </div>
              </div>
              
              <div className="p-4 space-y-4 -mt-4 relative z-10">
                {/* Prize Pool Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                   <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Total Prize Pool</p>
                   <p className="text-2xl font-black text-emerald-600">{formData.totalBudget.toLocaleString()} THB</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide border-b border-slate-50 pb-2">Reward Tiers</h4>
                  <div className="space-y-4">
                    {selectedTypes.map(type => {
                      const typeTiers = tiers.filter(t => t.tierType === type);
                      if (typeTiers.length === 0) return null;
                      return (
                        <div key={type}>
                          <h5 className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1">{getTypeIcon(type)} {getTypeLabel(type)}</h5>
                          <div className="space-y-2">
                            {typeTiers.map((tier, i) => (
                              <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                  <div className="text-xs font-bold text-slate-700">Rank {tier.rankStart}{tier.rankEnd !== tier.rankStart ? `-${tier.rankEnd}` : ''}</div>
                                  <div className="text-[10px] text-slate-500">{tier.description}</div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">฿{tier.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Rules</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {formData.description || 'Campaign details will appear here...'}
                  </p>
                </div>
                
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Requirements</h4>
                   <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="block text-slate-400">Min. Followers</span>
                        <span className="font-semibold text-slate-700">{formData.minFollowers || '-'}</span>
                      </div>
                       <div className="bg-slate-50 p-2 rounded">
                        <span className="block text-slate-400">Category</span>
                        <span className="font-semibold text-slate-700">{formData.category || '-'}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-4 mt-2">
                <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">
                  Join Campaign Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};