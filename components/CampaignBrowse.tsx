import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Users, DollarSign, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { CampaignType } from '../types';

const categories = ['All', 'Fashion', 'Tech', 'Beauty', 'Lifestyle', 'Food'];

export const CampaignBrowse: React.FC = () => {
  const { campaigns } = useCampaigns();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter campaigns (only show Active or Upcoming for creators)
  const availableCampaigns = campaigns.filter(c => {
    const isVisibleStatus = c.status === 'active' || c.status === 'upcoming';
    const matchesCategory = activeCategory === 'All' || c.requirements?.category?.includes(activeCategory);
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.brandName.toLowerCase().includes(searchQuery.toLowerCase());
    return isVisibleStatus && matchesCategory && matchesSearch;
  });

  const getTagColor = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return 'bg-indigo-600';
      case CampaignType.CONTENT_VOLUME: return 'bg-blue-600';
      case CampaignType.LUCKY_DRAW: return 'bg-pink-600';
      default: return 'bg-slate-800';
    }
  };

  const getTypeLabel = (type: CampaignType) => {
    switch (type) {
      case CampaignType.GMV: return 'Top Sales';
      case CampaignType.CONTENT_VOLUME: return 'Content Volume';
      case CampaignType.LUCKY_DRAW: return 'Lucky Draw';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns, brands..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <SlidersHorizontal size={16} />
            More Filters
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {availableCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">No campaigns found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={campaign.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {campaign.type.slice(0, 2).map(t => (
                    <span key={t} className={`backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wide ${getTagColor(t)}`}>
                      {getTypeLabel(t)}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></div>
                  {campaign.status === 'active' ? 'Live' : 'Upcoming'}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{campaign.title}</h3>
                  <p className="text-sm text-slate-500">by {campaign.brandName}</p>
                </div>
                
                <div className="space-y-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1"><DollarSign size={14}/> Prize Pool</span>
                    <span className="font-bold text-emerald-600">฿{campaign.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1"><Users size={14}/> Applicants</span>
                    <span className="font-medium text-slate-900">{campaign.applicants || 0}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1"><Calendar size={14}/> Ends</span>
                    <span className="font-medium text-slate-900">{campaign.endDate}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <NavLink to={`/browse/${campaign.id}`} className="block w-full text-center py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    View Details
                  </NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};