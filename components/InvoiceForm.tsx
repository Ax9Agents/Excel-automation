'use client';

import { useState } from 'react';
import { Upload, Plus, Trash2, Download, RotateCcw, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AutofillInput from './AutofillInput';

interface Item {
  description: string;
  hsnCode: string;
  qtyKgs: number;
  pcs: number;
  rateUSD: number;
}

interface GeneratedInvoice {
  invoiceNumber: string;
  excelLink: string;
  pdfLink: string;
  invoiceId: string;
}

interface RelatedData {
  [key: string]: string | undefined;
}

export default function InvoiceForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  
  // NEW: Preview state for hover
  const [originalFormData, setOriginalFormData] = useState<Record<string, string | number> | null>(null);
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    buyerOrderNo: '',
    buyerOrderDate: '',
    exporterName: '',
    exporterAddress: '',
    exporterCity: '',
    exporterState: '',
    exporterPhone: '',
    exporterFax: '',
    exporterGSTIN: '',
    exporterIEC: '',
    exporterBank: '',
    exporterAccount: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeCity: '',
    consigneeState: '',
    consigneeCountry: '',
    consigneePhone: '',
    countryOrigin: 'INDIA',
    countryDestination: '',
    portOfLoading: '',
    portOfDischarge: '',
    termsOfDelivery: 'CNF - ADVANCE PAYMENT',
    productDescription: 'ESSENTIAL OILS - FOR EXTERNAL USE ONLY',
    currency: 'USD',
    exchangeRate: 82.55,
    totalBoxes: 1,
  });

  const [items, setItems] = useState<Item[]>([
    { description: '', hsnCode: '3302', qtyKgs: 0, pcs: 0, rateUSD: 0 },
  ]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler for hover preview - Shows data temporarily without saving
  const handleHoverPreview = (fieldName: string, relatedData: RelatedData | null) => {
    if (!relatedData) {
      // Clear preview - restore original values
      if (originalFormData) {
        setFormData(originalFormData as typeof formData);
        setOriginalFormData(null);
      }
      return;
    }

    // Backup current data if not already backed up
    if (!originalFormData) {
      setOriginalFormData({ ...formData });
    }

    // Apply preview based on field
    switch (fieldName) {
      case 'exporter_name':
        setFormData(prev => ({
          ...prev,
          exporterAddress: relatedData.address || prev.exporterAddress,
          exporterCity: relatedData.city || prev.exporterCity,
          exporterState: relatedData.state || prev.exporterState,
          exporterPhone: relatedData.phone || prev.exporterPhone,
          exporterFax: relatedData.fax || prev.exporterFax,
          exporterGSTIN: relatedData.gstin || prev.exporterGSTIN,
          exporterIEC: relatedData.iec || prev.exporterIEC,
          exporterBank: relatedData.bank || prev.exporterBank,
          exporterAccount: relatedData.account || prev.exporterAccount,
        }));
        break;

      case 'exporter_city':
      case 'exporter_state':
      case 'exporter_phone':
      case 'exporter_fax':
      case 'exporter_gstin':
      case 'exporter_iec':
      case 'exporter_bank':
      case 'exporter_account':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.address) setFormData(prev => ({ ...prev, exporterAddress: relatedData.address || prev.exporterAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, exporterCity: relatedData.city || prev.exporterCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, exporterState: relatedData.state || prev.exporterState }));
        if (relatedData.phone) setFormData(prev => ({ ...prev, exporterPhone: relatedData.phone || prev.exporterPhone }));
        break;

      case 'consignee_name':
        setFormData(prev => ({
          ...prev,
          consigneeAddress: relatedData.address || prev.consigneeAddress,
          consigneeCity: relatedData.city || prev.consigneeCity,
          consigneeState: relatedData.state || prev.consigneeState,
          consigneeCountry: relatedData.country || prev.consigneeCountry,
          consigneePhone: relatedData.phone || prev.consigneePhone,
          countryDestination: relatedData.country || prev.countryDestination,
        }));
        break;

      case 'consignee_city':
      case 'consignee_state':
      case 'consignee_country':
      case 'consignee_phone':
        if (relatedData.name) setFormData(prev => ({ ...prev, consigneeName: relatedData.name || prev.consigneeName }));
        if (relatedData.address) setFormData(prev => ({ ...prev, consigneeAddress: relatedData.address || prev.consigneeAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, consigneeCity: relatedData.city || prev.consigneeCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, consigneeState: relatedData.state || prev.consigneeState }));
        if (relatedData.country) setFormData(prev => ({ ...prev, consigneeCountry: relatedData.country || prev.consigneeCountry }));
        break;

      case 'port_loading':
        if (relatedData.portDischarge) setFormData(prev => ({ ...prev, portOfDischarge: relatedData.portDischarge || prev.portOfDischarge }));
        if (relatedData.country) setFormData(prev => ({ ...prev, countryDestination: relatedData.country || prev.countryDestination }));
        break;

      case 'port_discharge':
        if (relatedData.portLoading) setFormData(prev => ({ ...prev, portOfLoading: relatedData.portLoading || prev.portOfLoading }));
        if (relatedData.country) setFormData(prev => ({ ...prev, countryDestination: relatedData.country || prev.countryDestination }));
        break;

      case 'invoice_number':
        if (relatedData.date) setFormData(prev => ({ ...prev, invoiceDate: relatedData.date || prev.invoiceDate }));
        if (relatedData.buyerOrderNo) setFormData(prev => ({ ...prev, buyerOrderNo: relatedData.buyerOrderNo || prev.buyerOrderNo }));
        if (relatedData.buyerOrderDate) setFormData(prev => ({ ...prev, buyerOrderDate: relatedData.buyerOrderDate || prev.buyerOrderDate }));
        break;
    }
  };

  // Handler for autofill with related data - FILLS ALL FIELDS PERMANENTLY
  const handleAutofillSelect = (fieldName: string, relatedData: RelatedData) => {
    if (!relatedData) return;
    
    // Clear original backup since we're committing the change
    setOriginalFormData(null);
    
    switch (fieldName) {
      // EXPORTER FIELDS
      case 'exporter_name':
        if (relatedData.address) setFormData(prev => ({ ...prev, exporterAddress: relatedData.address || prev.exporterAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, exporterCity: relatedData.city || prev.exporterCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, exporterState: relatedData.state || prev.exporterState }));
        if (relatedData.phone) setFormData(prev => ({ ...prev, exporterPhone: relatedData.phone || prev.exporterPhone }));
        if (relatedData.fax) setFormData(prev => ({ ...prev, exporterFax: relatedData.fax || prev.exporterFax }));
        if (relatedData.gstin) setFormData(prev => ({ ...prev, exporterGSTIN: relatedData.gstin || prev.exporterGSTIN }));
        if (relatedData.iec) setFormData(prev => ({ ...prev, exporterIEC: relatedData.iec || prev.exporterIEC }));
        if (relatedData.bank) setFormData(prev => ({ ...prev, exporterBank: relatedData.bank || prev.exporterBank }));
        if (relatedData.account) setFormData(prev => ({ ...prev, exporterAccount: relatedData.account || prev.exporterAccount }));
        toast.success('✨ Auto-filled all exporter details!');
        break;
        
      case 'exporter_city':
      case 'exporter_state':
      case 'exporter_phone':
      case 'exporter_fax':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.address) setFormData(prev => ({ ...prev, exporterAddress: relatedData.address || prev.exporterAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, exporterCity: relatedData.city || prev.exporterCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, exporterState: relatedData.state || prev.exporterState }));
        toast.success('✨ Auto-filled related exporter details!');
        break;
        
      case 'exporter_gstin':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.iec) setFormData(prev => ({ ...prev, exporterIEC: relatedData.iec || prev.exporterIEC }));
        toast.success('✨ Auto-filled exporter name and IEC!');
        break;
        
      case 'exporter_iec':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.gstin) setFormData(prev => ({ ...prev, exporterGSTIN: relatedData.gstin || prev.exporterGSTIN }));
        toast.success('✨ Auto-filled exporter name and GSTIN!');
        break;
        
      case 'exporter_bank':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.account) setFormData(prev => ({ ...prev, exporterAccount: relatedData.account || prev.exporterAccount }));
        toast.success('✨ Auto-filled account number!');
        break;
        
      case 'exporter_account':
        if (relatedData.name) setFormData(prev => ({ ...prev, exporterName: relatedData.name || prev.exporterName }));
        if (relatedData.bank) setFormData(prev => ({ ...prev, exporterBank: relatedData.bank || prev.exporterBank }));
        toast.success('✨ Auto-filled bank name!');
        break;

      // CONSIGNEE FIELDS
      case 'consignee_name':
        if (relatedData.address) setFormData(prev => ({ ...prev, consigneeAddress: relatedData.address || prev.consigneeAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, consigneeCity: relatedData.city || prev.consigneeCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, consigneeState: relatedData.state || prev.consigneeState }));
        if (relatedData.country) setFormData(prev => ({ ...prev, consigneeCountry: relatedData.country || prev.consigneeCountry }));
        if (relatedData.phone) setFormData(prev => ({ ...prev, consigneePhone: relatedData.phone || prev.consigneePhone }));
        if (relatedData.country) setFormData(prev => ({ ...prev, countryDestination: relatedData.country || prev.countryDestination }));
        toast.success('✨ Auto-filled all consignee details!');
        break;
        
      case 'consignee_city':
      case 'consignee_state':
      case 'consignee_country':
      case 'consignee_phone':
        if (relatedData.name) setFormData(prev => ({ ...prev, consigneeName: relatedData.name || prev.consigneeName }));
        if (relatedData.address) setFormData(prev => ({ ...prev, consigneeAddress: relatedData.address || prev.consigneeAddress }));
        if (relatedData.city) setFormData(prev => ({ ...prev, consigneeCity: relatedData.city || prev.consigneeCity }));
        if (relatedData.state) setFormData(prev => ({ ...prev, consigneeState: relatedData.state || prev.consigneeState }));
        if (relatedData.country) setFormData(prev => ({ ...prev, consigneeCountry: relatedData.country || prev.consigneeCountry }));
        toast.success('✨ Auto-filled related consignee details!');
        break;

      // SHIPPING & DESTINATION FIELDS
      case 'port_loading':
        if (relatedData.portDischarge) setFormData(prev => ({ ...prev, portOfDischarge: relatedData.portDischarge || prev.portOfDischarge }));
        if (relatedData.country) setFormData(prev => ({ ...prev, countryDestination: relatedData.country || prev.countryDestination }));
        if (relatedData.portDischarge) toast.success('✨ Auto-filled port of discharge!');
        break;
        
      case 'port_discharge':
        if (relatedData.portLoading) setFormData(prev => ({ ...prev, portOfLoading: relatedData.portLoading || prev.portOfLoading }));
        if (relatedData.country) setFormData(prev => ({ ...prev, countryDestination: relatedData.country || prev.countryDestination }));
        if (relatedData.portLoading) toast.success('✨ Auto-filled port of loading!');
        break;

      // INVOICE FIELDS
      case 'invoice_number':
        if (relatedData.date) setFormData(prev => ({ ...prev, invoiceDate: relatedData.date || prev.invoiceDate }));
        if (relatedData.buyerOrderNo) setFormData(prev => ({ ...prev, buyerOrderNo: relatedData.buyerOrderNo || prev.buyerOrderNo }));
        if (relatedData.buyerOrderDate) setFormData(prev => ({ ...prev, buyerOrderDate: relatedData.buyerOrderDate || prev.buyerOrderDate }));
        if (relatedData.date || relatedData.buyerOrderNo) toast.success('✨ Auto-filled related invoice details!');
        break;
    }
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', hsnCode: '3302', qtyKgs: 0, pcs: 0, rateUSD: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast.error('You must have at least one item');
    }
  };

  const calculateTotals = () => {
    const totalPcs = items.reduce((sum, item) => sum + (Number(item.pcs) || 0), 0);
    const totalKgs = items.reduce((sum, item) => sum + (Number(item.qtyKgs) || 0), 0);
    return { totalPcs, totalKgs };
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset the form? All data will be lost.')) {
      return;
    }
    
    setFormData({
      invoiceNumber: '',
      invoiceDate: '',
      buyerOrderNo: '',
      buyerOrderDate: '',
      exporterName: '',
      exporterAddress: '',
      exporterCity: '',
      exporterState: '',
      exporterPhone: '',
      exporterFax: '',
      exporterGSTIN: '',
      exporterIEC: '',
      exporterBank: '',
      exporterAccount: '',
      consigneeName: '',
      consigneeAddress: '',
      consigneeCity: '',
      consigneeState: '',
      consigneeCountry: '',
      consigneePhone: '',
      countryOrigin: 'INDIA',
      countryDestination: '',
      portOfLoading: '',
      portOfDischarge: '',
      termsOfDelivery: 'CNF - ADVANCE PAYMENT',
      productDescription: 'ESSENTIAL OILS - FOR EXTERNAL USE ONLY',
      currency: 'USD',
      exchangeRate: 82.55,
      totalBoxes: 1,
    });
    setItems([{ description: '', hsnCode: '3302', qtyKgs: 0, pcs: 0, rateUSD: 0 }]);
    setGeneratedInvoice(null);
    setShowPreview(false);
    setOriginalFormData(null);
    toast.success('Form reset successfully!');
  };

  const handleExtractFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setExtracting(true);
    const toastId = toast.loading('🤖 AI is extracting data from Excel... Please wait.');

    try {
      const response = await fetch('/api/extract-excel', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const extracted = result.data;

        setFormData((prev) => ({
          ...prev,
          invoiceNumber: extracted.invoiceNumber || prev.invoiceNumber,
          invoiceDate: extracted.invoiceDate || prev.invoiceDate,
          buyerOrderNo: extracted.buyerOrderNo || prev.buyerOrderNo,
          buyerOrderDate: extracted.buyerOrderDate || prev.buyerOrderDate,
          exporterName: extracted.exporterName || prev.exporterName,
          exporterAddress: extracted.exporterAddress || prev.exporterAddress,
          consigneeName: extracted.consigneeName || prev.consigneeName,
          consigneeAddress: extracted.consigneeAddress || prev.consigneeAddress,
          countryDestination: extracted.countryDestination || prev.countryDestination,
          portOfLoading: extracted.portOfLoading || prev.portOfLoading,
          portOfDischarge: extracted.portOfDischarge || prev.portOfDischarge,
          currency: extracted.currency || prev.currency,
          exchangeRate: extracted.exchangeRate || prev.exchangeRate,
          totalBoxes: extracted.totalBoxes || prev.totalBoxes,
          termsOfDelivery: extracted.termsOfDelivery || prev.termsOfDelivery,
        }));

        if (extracted.items && extracted.items.length > 0) {
          setItems(extracted.items.map((item: Item) => ({
            description: item.description || '',
            hsnCode: item.hsnCode || '3302',
            qtyKgs: item.qtyKgs || 0,
            pcs: item.pcs || 0,
            rateUSD: item.rateUSD || 0
          })));
        }

        toast.success('✨ Data extracted successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to extract data', { id: toastId });
      }
    } catch (error) {
      const err = error as Error;
      toast.error('Error extracting data: ' + err.message, { id: toastId });
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!formData.invoiceNumber || !formData.invoiceDate) {
      toast.error('Please fill in Invoice Number and Date');
      return;
    }

    if (!formData.exporterName || !formData.exporterAddress) {
      toast.error('Please fill in Exporter details');
      return;
    }

    if (!formData.consigneeName || !formData.countryDestination) {
      toast.error('Please fill in Consignee details');
      return;
    }

    if (items.some((item) => !item.description || item.pcs === 0)) {
      toast.error('Please fill in all item details with at least 1 piece');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('🤖 AI is enriching your invoice data...');

    try {
      const { totalPcs, totalKgs } = calculateTotals();

      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        buyerOrderNo: formData.buyerOrderNo || 'N/A',
        buyerOrderDate: formData.buyerOrderDate || formData.invoiceDate,
        exporter: {
          name: formData.exporterName,
          address: formData.exporterAddress,
          city: formData.exporterCity,
          state: formData.exporterState,
          phone: formData.exporterPhone,
          fax: formData.exporterFax,
          gstin: formData.exporterGSTIN,
          iec: formData.exporterIEC,
          bankName: formData.exporterBank,
          accountNo: formData.exporterAccount,
        },
        consignee: {
          name: formData.consigneeName,
          address: formData.consigneeAddress,
          city: formData.consigneeCity,
          state: formData.consigneeState,
          country: formData.consigneeCountry,
          phone: formData.consigneePhone,
        },
        buyer: 'SAME AS CONSIGNEE',
        countryOfOrigin: formData.countryOrigin,
        countryOfDestination: formData.countryDestination,
        preCarriageBy: '',
        placeOfReceipt: '',
        termsOfDelivery: formData.termsOfDelivery,
        vesselFlightNo: '',
        portOfLoading: formData.portOfLoading,
        portOfDischarge: formData.portOfDischarge,
        finalDestination: '',
        productDescription: formData.productDescription,
        currency: formData.currency,
        exchangeRate: Number(formData.exchangeRate),
        items: items.map((item, idx) => ({
          sno: String(idx + 1),
          description: item.description,
          hsnCode: item.hsnCode,
          qtyKgs: Number(item.qtyKgs),
          pcs: Number(item.pcs),
          rateUSD: Number(item.rateUSD),
          igstRate: 0.18,
        })),
        totalPcs,
        totalKgs,
        totalBoxes: Number(formData.totalBoxes),
      };

      toast.loading('📄 Generating Excel and PDF...', { id: toastId });

      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, invoiceData }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedInvoice(result.data);
        setShowPreview(true);
        toast.success('✅ Invoice generated successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to generate invoice', { id: toastId });
      }
    } catch (error) {
      const err = error as Error;
      toast.error('Error: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const { totalPcs, totalKgs } = calculateTotals();

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 relative">
        {/* Loading Overlay during extraction */}
        {extracting && (
          <div className="absolute inset-0 bg-white bg-opacity-95 z-40 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl font-bold text-gray-900">🤖 AI is extracting data...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait, do not close this page</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Sparkles className="w-4 h-4 inline mr-1 text-yellow-500" />
              AI will automatically enrich your data
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${(extracting || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">
                {extracting ? 'Extracting...' : 'Extract from Excel'}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExtractFromExcel}
                disabled={extracting || loading}
                className="hidden"
              />
            </label>

            <button
              onClick={handleReset}
              disabled={extracting || loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-sm font-medium">Reset</span>
            </button>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AutofillInput
            label="Invoice Number"
            value={formData.invoiceNumber}
            onChange={(value) => handleInputChange('invoiceNumber', value)}
            onRelatedDataSelect={(data) => handleAutofillSelect('invoice_number', data)}
            onHoverPreview={(data) => handleHoverPreview('invoice_number', data)}
            userId={userId}
            fieldName="invoice_number"
            disabled={extracting || loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              disabled={extracting || loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <AutofillInput
            label="Buyer Order No"
            value={formData.buyerOrderNo}
            onChange={(value) => handleInputChange('buyerOrderNo', value)}
            userId={userId}
            fieldName="buyer_order_no"
            disabled={extracting || loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Order Date
            </label>
            <input
              type="date"
              value={formData.buyerOrderDate}
              onChange={(e) => handleInputChange('buyerOrderDate', e.target.value)}
              disabled={extracting || loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Exporter Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded"></span>
            Exporter Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AutofillInput
              label="Exporter Name"
              value={formData.exporterName}
              onChange={(value) => handleInputChange('exporterName', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_name', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_name', data)}
              userId={userId}
              fieldName="exporter_name"
              disabled={extracting || loading}
              required
            />

            <AutofillInput
              label="Exporter Phone"
              value={formData.exporterPhone}
              onChange={(value) => handleInputChange('exporterPhone', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_phone', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_phone', data)}
              userId={userId}
              fieldName="exporter_phone"
              disabled={extracting || loading}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exporter Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.exporterAddress}
                onChange={(e) => handleInputChange('exporterAddress', e.target.value)}
                rows={2}
                disabled={extracting || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Street address"
                required
              />
            </div>

            <AutofillInput
              label="City"
              value={formData.exporterCity}
              onChange={(value) => handleInputChange('exporterCity', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_city', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_city', data)}
              userId={userId}
              fieldName="exporter_city"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="State"
              value={formData.exporterState}
              onChange={(value) => handleInputChange('exporterState', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_state', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_state', data)}
              userId={userId}
              fieldName="exporter_state"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="Fax (Optional)"
              value={formData.exporterFax}
              onChange={(value) => handleInputChange('exporterFax', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_fax', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_fax', data)}
              userId={userId}
              fieldName="exporter_fax"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="GSTIN"
              value={formData.exporterGSTIN}
              onChange={(value) => handleInputChange('exporterGSTIN', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_gstin', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_gstin', data)}
              userId={userId}
              fieldName="exporter_gstin"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="IEC"
              value={formData.exporterIEC}
              onChange={(value) => handleInputChange('exporterIEC', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_iec', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_iec', data)}
              userId={userId}
              fieldName="exporter_iec"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="Bank Name"
              value={formData.exporterBank}
              onChange={(value) => handleInputChange('exporterBank', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_bank', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_bank', data)}
              userId={userId}
              fieldName="exporter_bank"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="Account Number"
              value={formData.exporterAccount}
              onChange={(value) => handleInputChange('exporterAccount', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('exporter_account', data)}
              onHoverPreview={(data) => handleHoverPreview('exporter_account', data)}
              userId={userId}
              fieldName="exporter_account"
              disabled={extracting || loading}
            />
          </div>
        </div>

        {/* Consignee Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-600 rounded"></span>
            Consignee Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AutofillInput
              label="Consignee Name"
              value={formData.consigneeName}
              onChange={(value) => handleInputChange('consigneeName', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('consignee_name', data)}
              onHoverPreview={(data) => handleHoverPreview('consignee_name', data)}
              userId={userId}
              fieldName="consignee_name"
              disabled={extracting || loading}
              required
            />

            <AutofillInput
              label="Consignee Phone"
              value={formData.consigneePhone}
              onChange={(value) => handleInputChange('consigneePhone', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('consignee_phone', data)}
              onHoverPreview={(data) => handleHoverPreview('consignee_phone', data)}
              userId={userId}
              fieldName="consignee_phone"
              disabled={extracting || loading}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consignee Address
              </label>
              <textarea
                value={formData.consigneeAddress}
                onChange={(e) => handleInputChange('consigneeAddress', e.target.value)}
                rows={2}
                disabled={extracting || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Street address"
              />
            </div>

            <AutofillInput
              label="City"
              value={formData.consigneeCity}
              onChange={(value) => handleInputChange('consigneeCity', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('consignee_city', data)}
              onHoverPreview={(data) => handleHoverPreview('consignee_city', data)}
              userId={userId}
              fieldName="consignee_city"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="State"
              value={formData.consigneeState}
              onChange={(value) => handleInputChange('consigneeState', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('consignee_state', data)}
              onHoverPreview={(data) => handleHoverPreview('consignee_state', data)}
              userId={userId}
              fieldName="consignee_state"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="Country"
              value={formData.consigneeCountry}
              onChange={(value) => handleInputChange('consigneeCountry', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('consignee_country', data)}
              onHoverPreview={(data) => handleHoverPreview('consignee_country', data)}
              userId={userId}
              fieldName="consignee_country"
              disabled={extracting || loading}
              required
            />
          </div>
        </div>

        {/* Shipping Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-600 rounded"></span>
            Shipping & Payment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AutofillInput
              label="Country of Destination"
              value={formData.countryDestination}
              onChange={(value) => handleInputChange('countryDestination', value)}
              userId={userId}
              fieldName="country_destination"
              disabled={extracting || loading}
              required
            />

            <AutofillInput
              label="Port of Loading"
              value={formData.portOfLoading}
              onChange={(value) => handleInputChange('portOfLoading', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('port_loading', data)}
              onHoverPreview={(data) => handleHoverPreview('port_loading', data)}
              userId={userId}
              fieldName="port_loading"
              disabled={extracting || loading}
            />

            <AutofillInput
              label="Port of Discharge"
              value={formData.portOfDischarge}
              onChange={(value) => handleInputChange('portOfDischarge', value)}
              onRelatedDataSelect={(data) => handleAutofillSelect('port_discharge', data)}
              onHoverPreview={(data) => handleHoverPreview('port_discharge', data)}
              userId={userId}
              fieldName="port_discharge"
              disabled={extracting || loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                disabled={extracting || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange Rate (to INR)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.exchangeRate}
                onChange={(e) => handleInputChange('exchangeRate', parseFloat(e.target.value))}
                disabled={extracting || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Boxes</label>
              <input
                type="number"
                value={formData.totalBoxes}
                onChange={(e) => handleInputChange('totalBoxes', parseInt(e.target.value) || 1)}
                disabled={extracting || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-600 rounded"></span>
              Items
              <span className="text-sm font-normal text-gray-500">
                (AI will add batch, dates, botanical names)
              </span>
            </h3>
            <button
              onClick={addItem}
              disabled={extracting || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    disabled={extracting || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., PEPPERMINT OIL"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                    disabled={extracting || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qty (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={item.qtyKgs || ''}
                    onChange={(e) => handleItemChange(index, 'qtyKgs', parseFloat(e.target.value) || 0)}
                    disabled={extracting || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pieces <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.pcs || ''}
                    onChange={(e) => handleItemChange(index, 'pcs', parseInt(e.target.value) || 0)}
                    disabled={extracting || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate/{formData.currency}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.rateUSD || ''}
                    onChange={(e) => handleItemChange(index, 'rateUSD', parseFloat(e.target.value) || 0)}
                    disabled={extracting || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1 || extracting || loading}
                    className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={items.length === 1 ? 'Cannot remove last item' : 'Remove item'}
                  >
                    <Trash2 className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pieces</p>
              <p className="text-3xl font-bold text-blue-600">{totalPcs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Weight (kg)</p>
              <p className="text-3xl font-bold text-indigo-600">{totalKgs.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Boxes</p>
              <p className="text-3xl font-bold text-purple-600">{formData.totalBoxes}</p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || extracting}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Generating Invoice...</span>
            </>
          ) : (
            <>
              <Download className="w-6 h-6" />
              <span>Generate Invoice with AI</span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </>
          )}
        </button>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && generatedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">✅ Invoice Generated Successfully!</h3>
                <p className="text-sm text-gray-600 mt-1">Invoice #{generatedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <iframe
                src={generatedInvoice.pdfLink}
                className="w-full h-[600px] border-2 border-gray-300 rounded-lg bg-white shadow-inner"
                title="Invoice Preview"
              />
            </div>

            <div className="p-6 border-t border-gray-200 bg-white flex gap-4">
              <a
                href={generatedInvoice.excelLink}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Excel
              </a>
              <a
                href={generatedInvoice.pdfLink}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}