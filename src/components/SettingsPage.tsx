import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  QrCode, 
  Image as ImageIcon,
  Save, 
  BadgeCheck, 
  HelpCircle,
  Building
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { updateBusinessSettings, DEFAULT_SETTINGS } from '../dbService';

interface SettingsPageProps {
  settings: BusinessSettings;
  onRefresh: () => void;
}

export default function SettingsPage({ settings, onRefresh }: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  // Hydrate fields
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || DEFAULT_SETTINGS.businessName);
      setAddress(settings.address || DEFAULT_SETTINGS.address);
      setMobile(settings.mobile || DEFAULT_SETTINGS.mobile);
      setEmail(settings.email || DEFAULT_SETTINGS.email);
      setGstNo(settings.gstNo || '');
      setUpiId(settings.upiId || DEFAULT_SETTINGS.upiId);
      setLogoUrl(settings.logoUrl || '');
      setQrCodeUrl(settings.qrCodeUrl || '');
      setTermsAndConditions(settings.termsAndConditions || DEFAULT_SETTINGS.termsAndConditions);
    }
  }, [settings]);

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100000) { // Limit size to ~100kb for Firestore base64 compatibility
        alert('File is too large. Please select an image under 100KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle QR code file upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100000) {
        alert('File is too large. Please select an image under 100KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const updatedSettings = {
      businessName,
      address,
      mobile,
      email,
      gstNo,
      upiId,
      logoUrl,
      qrCodeUrl,
      termsAndConditions
    };

    try {
      await updateBusinessSettings(updatedSettings);
      setMessage('Business settings and configurations updated successfully!');
      onRefresh();
    } catch (err: any) {
      setError('Failed to update business settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Settings Form Layout (2/3 width) */}
      <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
        
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl transition-colors">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <SettingsIcon className="h-5.5 w-5.5 text-indigo-500" />
              <span>Business Settings &amp; Customization</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize invoice logos, company details, payment QR codes, and print receipts</p>
          </div>
          <button
            id="settings-save-btn"
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Inputs Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 transition-colors space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building className="h-4.5 w-4.5 text-amber-500" />
            <span>Company Core Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Business Name *</label>
              <input
                id="set-bizname-input"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Mobile Contact Phone *</label>
              <input
                id="set-phone-input"
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Company Email Address</label>
              <input
                id="set-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">GSTIN Number (Optional)</label>
              <input
                id="set-gst-input"
                type="text"
                placeholder="e.g. 09ABCDE1234F1Z5"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Detailed Shop Address *</label>
            <input
              id="set-address-input"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>

          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <QrCode className="h-4.5 w-4.5 text-amber-500" />
            <span>Digital Payments Setup</span>
          </h3>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Merchant UPI ID (for QR Generation) *</label>
            <input
              id="set-upi-input"
              type="text"
              required
              placeholder="7905256355@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white"
            />
          </div>

          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText className="h-4.5 w-4.5 text-amber-500" />
            <span>Invoice Footer Terms &amp; Guidelines</span>
          </h3>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Invoice Terms &amp; Conditions</label>
            <textarea
              id="set-terms-textarea"
              rows={4}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl dark:text-white resize-none leading-relaxed"
            />
          </div>

        </div>

      </form>

      {/* Uploads Panel (1/3 width) */}
      <div className="space-y-6">
        
        {/* Logo and QR Upload blocks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-colors space-y-6 text-xs font-semibold">
          
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-4.5 w-4.5 text-amber-500" />
              <span>Asset Customization</span>
            </h3>
            <p className="text-[10px] text-slate-400">Upload images under 100KB to display directly on printed invoices</p>
          </div>

          {/* Logo upload */}
          <div className="space-y-3">
            <label className="block text-slate-500 dark:text-slate-400">Company Invoice Logo</label>
            <div className="flex items-center gap-4 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl">
              <div className="h-14 w-14 bg-slate-50 dark:bg-slate-850 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="object-contain max-h-full max-w-full" />
                ) : (
                  <Building className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  id="trigger-logo-upload"
                  onClick={() => document.getElementById('logo-file-input')?.click()}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-200/40 cursor-pointer"
                >
                  Choose Logo
                </button>
                {logoUrl && (
                  <button
                    id="remove-logo"
                    onClick={() => setLogoUrl('')}
                    className="block text-[10px] text-red-500 hover:underline mt-1 font-bold"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QR Code upload */}
          <div className="space-y-3">
            <label className="block text-slate-500 dark:text-slate-400">Static UPI Payment QR Code</label>
            <div className="flex items-center gap-4 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl">
              <div className="h-14 w-14 bg-slate-50 dark:bg-slate-850 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Payment QR" className="object-contain max-h-full max-w-full" />
                ) : (
                  <QrCode className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                />
                <button
                  id="trigger-qr-upload"
                  onClick={() => document.getElementById('qr-file-input')?.click()}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-200/40 cursor-pointer"
                >
                  Choose QR Image
                </button>
                {qrCodeUrl && (
                  <button
                    id="remove-qr"
                    onClick={() => setQrCodeUrl('')}
                    className="block text-[10px] text-red-500 hover:underline mt-1 font-bold"
                  >
                    Remove QR
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Informational Guidelines Card */}
        <div className="bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-850 p-5 rounded-2xl text-center text-xs text-slate-500 font-semibold space-y-1.5 transition-colors">
          <BadgeCheck className="h-9 w-9 text-indigo-500 mx-auto" />
          <p className="text-slate-700 dark:text-slate-300 font-black uppercase">Invoice Compliance</p>
          <p>The details provided here (Address, Mobile, UPI ID, terms, and custom logos) are automatically pulled to compile the beautiful printable A4 invoices generated inside the Orders panel.</p>
        </div>

      </div>

    </div>
  );
}
