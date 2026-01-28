import React from 'react';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { Message } from '../types';

const mockMessages: Message[] = [
  { id: '1', sender: 'Jane Doe', avatar: 'https://picsum.photos/seed/u1/40', content: "Hi! I just submitted the video for the campaign.", timestamp: '10:30 AM', unread: true },
  { id: '2', sender: 'Brand Manager', avatar: 'https://picsum.photos/seed/u2/40', content: "Great, we will review it shortly!", timestamp: '10:32 AM', unread: false },
];

export const Messaging: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 ${i === 1 ? 'bg-indigo-50/50' : ''}`}>
              <div className="relative">
                <img src={`https://picsum.photos/seed/user${i}/50`} className="w-10 h-10 rounded-full object-cover" />
                {i === 1 && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">Sarah Jenkins</h4>
                  <span className="text-xs text-slate-400">10:30 AM</span>
                </div>
                <p className="text-xs text-slate-500 truncate">I've updated the draft based on your feedback.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/user1/50" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sarah Jenkins</h3>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={18} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={18} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          <div className="flex justify-center">
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
          </div>
          
          <div className="flex gap-3 max-w-[80%]">
            <img src="https://picsum.photos/seed/user1/50" className="w-8 h-8 rounded-full self-end mb-1" />
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-sm text-slate-700">
              <p>Hi! I just uploaded the new draft for the Summer Campaign.</p>
            </div>
          </div>

          <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold self-end mb-1">Me</div>
             <div className="bg-indigo-600 p-3 rounded-2xl rounded-br-none shadow-sm text-sm text-white">
              <p>Thanks Sarah! Checking it now.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
