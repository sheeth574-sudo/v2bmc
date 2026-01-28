import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  Briefcase, 
  Search, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X,
  List
} from 'lucide-react';
import { UserRole } from '../types';
import { useUser } from '../contexts/UserContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const brandLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/campaigns', icon: List, label: 'My Campaigns' },
    { to: '/create-campaign', icon: PlusCircle, label: 'New Campaign' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const creatorLinks = [
    { to: '/', icon: LayoutDashboard, label: 'My Stats' },
    { to: '/browse', icon: Search, label: 'Find Campaigns' },
    { to: '/my-tasks', icon: Briefcase, label: 'My Tasks' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = role === UserRole.BRAND ? brandLinks : creatorLinks;

  // Determine if we should show the generic page header
  // We hide it for pages that have their own custom headers or structure (like details, settings, my-tasks)
  const hideHeaderPaths = ['/settings', '/my-tasks', '/messages'];
  
  // Check if it's a detail page (e.g., /campaigns/123, /submit/123)
  const isDetailPage = 
    (location.pathname.startsWith('/campaigns/') && location.pathname.split('/').length > 2) ||
    (location.pathname.startsWith('/browse/') && location.pathname.split('/').length > 2) ||
    (location.pathname.startsWith('/submit/'));
  
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname) && !isDetailPage;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${role === UserRole.BRAND ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
            C
          </div>
          <span className="text-xl font-bold tracking-tight">CollabSphere</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            {role === UserRole.BRAND ? 'Brand Workspace' : 'Creator Space'}
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? role === UserRole.BRAND 
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
            <img 
              src={user.avatar}
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {role === UserRole.BRAND ? user.companyName : user.socialStats?.handle}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white border-b border-slate-200 z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${role === UserRole.BRAND ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
            C
          </div>
          <span className="font-bold text-lg">CollabSphere</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800/50 z-10 pt-16">
          <div className="bg-white h-full w-3/4 p-4 shadow-xl">
             <div className="mb-6 flex items-center gap-3 pb-6 border-b border-slate-100">
               <img src={user.avatar} className="w-12 h-12 rounded-full" />
               <div>
                 <p className="font-bold">{user.name}</p>
                 <p className="text-xs text-slate-500">{role}</p>
               </div>
             </div>
             <nav className="space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
                    }`
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-slate-100">
               <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={16}/> Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Reverted to max-w-7xl mx-auto */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-7xl mx-auto">
        {/* Top Bar (Desktop) - Only show if not a detail/custom page */}
        {shouldShowHeader ? (
          <header className="hidden md:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {location.pathname === '/' ? 'Overview' : location.pathname.split('/')[1].replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
              </h1>
              <p className="text-slate-500 text-sm">
                {role === UserRole.BRAND 
                  ? 'Manage your campaigns and creator relationships.' 
                  : 'Track your tasks and explore new opportunities.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
          </header>
        ) : (
           /* Just the notification bell for pages without generic header */
           <div className="hidden md:flex justify-end mb-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
           </div>
        )}

        {children}
      </main>
    </div>
  );
};