import React from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { runWithOklchCleanedStyles } from '../utils/pdfHelper';
import { 
  X, 
  Printer, 
  Download,
  Share2, 
  Camera, 
  Printer as PrinterIcon,
  Phone,
  MapPin,
  CheckCircle,
  Mail,
  Receipt
} from 'lucide-react';
import { Invoice, BusinessSettings, Order } from '../types';
import { parseInvoiceItem } from '../utils/invoiceItemParser';

interface InvoicePrintViewProps {
  invoice: Invoice;
  settings: BusinessSettings;
  orders: Order[];
  onClose: () => void;
}

export default function InvoicePrintView({ invoice, settings, orders, onClose }: InvoicePrintViewProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  
  const balanceDue = invoice.balanceAmount;
  const isPaidFull = invoice.status === 'Paid' || balanceDue === 0;

  const matchedOrder = React.useMemo(() => {
    return orders?.find(o => o.orderId === invoice.orderId);
  }, [orders, invoice.orderId]);

  const parsedItem = React.useMemo(() => {
    if (matchedOrder) {
      return parseInvoiceItem({
        serviceType: matchedOrder.serviceType,
        details: matchedOrder.details,
        totalAmount: invoice.totalAmount || matchedOrder.totalAmount || 0
      });
    }
    
    return {
      serviceType: 'Service Job Print/Photography',
      description: `Job ID: ${invoice.orderId} - Services rendered`,
      quantity: 1,
      rate: invoice.totalAmount,
      total: invoice.totalAmount
    };
  }, [matchedOrder, invoice]);

  // Build UPI Link & QR Code
  const encodedUpiMerchant = encodeURIComponent(settings.upiId || '7905256355@upi');
  const encodedBusinessName = encodeURIComponent(settings.businessName || 'Shiv Studio');
  const upiUrl = `upi://pay?pa=${encodedUpiMerchant}&pn=${encodedBusinessName}&am=${balanceDue}&cu=INR`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;

  // Share message builder
  const handleWhatsAppShare = () => {
    const formattedMobile = invoice.mobile.length === 10 ? `91${invoice.mobile}` : invoice.mobile;
    const message = `*SHIV STUDIO & PRINTERS, KHAGA*\n\nDear *${invoice.customerName}*,\n\nHere are the details of your Invoice *${invoice.invoiceNo}*:\n• *Order Ref:* ${invoice.orderId}\n• *Invoice Date:* ${invoice.invoiceDate}\n• *Due Date:* ${invoice.dueDate}\n• *Total Amount:* ₹${invoice.totalAmount.toLocaleString('en-IN')}\n• *Advance Paid:* ₹${invoice.advanceAmount.toLocaleString('en-IN')}\n• *Balance Due:* ₹${invoice.balanceAmount.toLocaleString('en-IN')}\n• *Payment Status:* ${invoice.status}\n\n*Payment Details:*\nScan the QR code on your invoice or pay directly via UPI on *${settings.upiId}*.\n\nThank you for choosing Shiv Studio & Printers!\n📞 Contact: ${settings.mobile}`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedMobile}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    console.log("Print clicked");
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('print-invoice-a4');
      if (!element) {
        throw new Error('Invoice element not found');
      }
      
      const opt = {
        margin:       10,
        filename:     `Invoice_${invoice.invoiceNo}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      // Generate and save with oklch colors converted to standard RGB to prevent html2canvas crashes
      await runWithOklchCleanedStyles(async () => {
        await html2pdf().set(opt).from(element).save();
      });
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again or use the Print option.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="invoice-view-overlay" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-colors max-w-3xl mx-auto">
      
      {/* 1. Control Action Bar (Hidden during window.print) */}
      <div id="invoice-view-control-bar" className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden transition-colors">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-amber-500" />
          <span className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">A4 Printable Invoice</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            id="inv-view-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </button>

          <button
            id="inv-view-download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
          
          <button
            id="inv-view-share-btn"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp Share</span>
          </button>

          <button
            id="inv-view-close-btn"
            onClick={onClose}
            className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Main A4 Printable Area */}
      <div id="print-invoice-a4" className="print-invoice-target p-8 bg-white text-slate-800 print:p-0 print:text-black">
        
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b-2 border-slate-200">
          
          {/* Company Details Left */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
              ) : (
                <div className="flex shrink-0">
                  <div className="p-2 bg-slate-800 text-white rounded-lg">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="p-2 bg-slate-800 text-white rounded-lg -ml-1.5">
                    <PrinterIcon className="h-5 w-5" />
                  </div>
                </div>
              )}
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none uppercase">{settings.businessName}</h1>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Studio &amp; Printing Solutions</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-semibold space-y-1">
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-bold">Call: {settings.mobile}</span>
              </p>
              {settings.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Email: {settings.email}</span>
                </p>
              )}
              {settings.gstNo && (
                <p className="text-[10px] font-bold text-slate-400">
                  GSTIN: {settings.gstNo}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Info Right */}
          <div className="text-left md:text-right space-y-2 shrink-0 md:w-56">
            <h2 className="text-lg font-black text-slate-700 tracking-wider uppercase">Tax Invoice</h2>
            <div className="text-xs font-semibold text-slate-600 space-y-1">
              <p><span className="text-slate-400">Invoice No:</span> <strong className="text-slate-800 font-mono">{invoice.invoiceNo}</strong></p>
              <p><span className="text-slate-400">Invoice Date:</span> <strong>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
              <p><span className="text-slate-400">Due Date:</span> <strong className="text-slate-800">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
            </div>
          </div>

        </div>

        {/* Customer Info row */}
        <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Billed To (Customer Details)</p>
            <p className="text-sm font-black text-slate-800 leading-tight">{invoice.customerName}</p>
            <p className="text-slate-500 font-bold">Phone: {invoice.mobile}</p>
          </div>

          <div className="sm:text-right space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Billing Classification</p>
            <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {invoice.orderId.startsWith('SHIV-') ? '📸 Studio / Printing Reference' : '💼 Custom Ledger'}
            </span>
            <p className="text-slate-400 text-[11px] mt-1">Status: <strong className="text-slate-700 uppercase">{invoice.status}</strong></p>
          </div>
        </div>

        {/* Invoice Items table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b-2 border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5">Sl.</th>
                <th className="py-2.5">Service Job Item / Order Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100">
                <td className="py-4">01</td>
                <td className="py-4 space-y-1">
                  <p className="font-extrabold text-slate-850 text-sm">{parsedItem.serviceType}</p>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-lg">
                    {parsedItem.description}
                  </p>
                </td>
                <td className="py-4 text-center">{parsedItem.quantity}</td>
                <td className="py-4 text-right">₹{parsedItem.rate.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                <td className="py-4 text-right font-bold text-slate-850">₹{parsedItem.total.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Summaries and QR Code payments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
          
          {/* QR payment details / Static QR code representation */}
          <div className="space-y-4">
            
            {!isPaidFull ? (
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 flex items-start gap-4">
                <div className="shrink-0 bg-white border border-slate-200 p-1.5 rounded-lg">
                  {settings.qrCodeUrl ? (
                    <img src={settings.qrCodeUrl} alt="UPI QR" className="h-24 w-24 object-contain" />
                  ) : (
                    <img src={qrCodeApiUrl} alt="Scan to pay" className="h-24 w-24 object-contain" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Scan to Pay via UPI</p>
                  <p className="text-xs font-bold text-slate-700 leading-tight">Payable Due: ₹{balanceDue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400 leading-tight font-medium">Scan using PhonePe, GPay, Paytm, or BHIM UPI apps.</p>
                  <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">UPI: {settings.upiId}</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-700">
                <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Payment Settled</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Thank you! This transaction has been paid in full and settled.</p>
                </div>
              </div>
            )}

            {/* Terms and conditions */}
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terms &amp; Conditions:</p>
              <div className="text-[10px] text-slate-400 leading-relaxed font-medium whitespace-pre-line">
                {settings.termsAndConditions}
              </div>
            </div>

          </div>

          {/* Pricing breakdowns */}
          <div className="space-y-2.5 text-xs font-semibold text-slate-600">
            
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span>Gross Total Amount</span>
              <span className="text-slate-800">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span>Advance Paid Amount</span>
              <span className="text-emerald-600 font-bold">₹{invoice.advanceAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between border-b-2 border-double border-slate-200 py-2.5 text-sm font-black text-slate-800">
              <span className="uppercase">Net Outstanding Balance</span>
              <span className={balanceDue > 0 ? "text-amber-600 text-base" : "text-emerald-600 text-base"}>
                ₹{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Signature Area */}
            <div className="pt-8 text-center flex justify-between items-end text-[10px] font-bold text-slate-400 mt-6 uppercase">
              <div>
                <div className="h-12 border-b border-slate-200 w-36 mb-1" />
                <p>Customer Signature</p>
              </div>
              <div className="text-right">
                <p className="text-slate-800 font-extrabold pb-6">{settings.businessName}</p>
                <p>Authorized Signatory</p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer greeting card */}
        <div className="pt-8 mt-8 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <p>Thank you for your business! Have a wonderful day.</p>
        </div>

      </div>

    </div>
  );
}
