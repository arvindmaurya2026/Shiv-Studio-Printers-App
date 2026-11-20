import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  ReceiptIndianRupee, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Camera,
  Printer,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  settings: BusinessSettings;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode,
  settings
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout from the Admin panel?')) {
      await signOut(auth);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers (CRM)', icon: Users },
    { id: 'orders', label: 'Orders & Booking', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'expenses', label: 'Expense Tracker', icon: ReceiptIndianRupee },
    { id: 'reports', label: 'Reports & P&L', icon: TrendingUp },
    { id: 'settings', label: 'Business Settings', icon: SettingsIcon },
  ];

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside id="desktop-sidebar" className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
        
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-amber-500/5 to-indigo-600/5 dark:from-amber-500/10 dark:to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0">
              <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                <Camera className="h-4.5 w-4.5" />
              </div>
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg -ml-1">
                <Printer className="h-4.5 w-4.5" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase">Shiv Studio</h2>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-amber-400 tracking-widest uppercase">&amp; Printers</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`sidebar-nav-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-white shadow-xs dark:bg-indigo-600' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          {/* User profile */}
          <div className="px-2 mb-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Log in as</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{auth.currentUser?.email || 'Admin'}</p>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <button
              id="theme-toggle-desktop"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors shrink-0"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            <button
              id="logout-btn-desktop"
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Header and Mobile Nav */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header/Bar */}
        <header id="app-top-header" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 md:px-6 sticky top-0 z-40 shadow-xs shrink-0 transition-colors duration-300">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Header elements */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                id="mobile-hamburger-btn"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="h-5.5 w-5.5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex shrink-0">
                  <div className="p-1 bg-amber-500 text-white rounded-md">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                  <div className="p-1 bg-indigo-600 text-white rounded-md -ml-0.5">
                    <Printer className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <h1 className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-white uppercase leading-none">Shiv Studio</h1>
                  <span className="text-[8px] font-bold text-indigo-600 dark:text-amber-400 tracking-wider uppercase leading-none">&amp; Printers</span>
                </div>
              </div>
            </div>

            {/* Business Quick Details Header */}
            <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span className="truncate max-w-sm">{settings.address}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{settings.mobile}</span>
              </div>
            </div>

            {/* Quick Actions Right Side */}
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Fatehpur Control Room</span>
              </div>
              
              {/* Mobile theme toggle */}
              <button
                id="theme-toggle-mobile"
                onClick={() => setDarkMode(!darkMode)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div id="mobile-sidebar-drawer" className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-xs transition-opacity">
            <div className="w-64 bg-white dark:bg-slate-900 h-full flex flex-col p-5 shadow-2xl relative">
              <button
                id="close-mobile-drawer-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5.5 w-5.5" />
              </button>

              <div className="flex items-center gap-3 mb-8 mt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex shrink-0">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg -ml-1">
                    <Printer className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase">Shiv Studio</h2>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-amber-400 tracking-widest uppercase">&amp; Printers</span>
                </div>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      id={`mobile-nav-${item.id}`}
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-amber-500 text-white shadow-xs dark:bg-indigo-600' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="px-2 mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Log in as</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{auth.currentUser?.email || 'Admin'}</p>
                </div>
                <button
                  id="mobile-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-200 dark:border-red-900/30 hover:bg-red-50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main id="app-main-content-scroll" className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Bottom Footer Details */}
        <footer className="py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col md:flex-row justify-between items-center px-6 gap-2">
          <p>© 2026 Shiv Studio &amp; Printers. Fatehpur, Uttar Pradesh.</p>
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Khaga, Over Bridge Ke Niche, Fatehpur | Call: {settings.mobile}
          </p>
        </footer>
      </div>

    </div>
  );
}
