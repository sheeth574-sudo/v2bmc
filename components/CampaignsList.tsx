import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit3, BarChart2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';

export const CampaignsList: React.FC = () => {
  const { campaigns } = useCampaigns();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Active', 'Draft', 'Upcoming', 'Completed'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-slate-100 text-slate-600';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesTab = activeTab === 'All' || c.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <NavLink 
          to="/create-campaign"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Create Campaign
        </NavLink>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-indigo-600' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicants</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Spent</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No campaigns found in this tab.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{campaign.title}</div>
                      <div className="text-xs text-slate-500">ID: #{campaign.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Eye size={16} className="text-slate-400" />
                        {campaign.applicants} creators
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       <div className="flex flex-col gap-1">
                         <span>{campaign.spent.toLocaleString()} / {campaign.totalBudget.toLocaleString()}</span>
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${(campaign.spent / campaign.totalBudget) * 100}%`}}
                           ></div>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {campaign.endDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                        <NavLink to={`/campaigns/${campaign.id}`} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-xs flex items-center gap-1">
                          <Edit3 size={14} /> Manage
                        </NavLink>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};