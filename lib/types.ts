export interface InvoiceItem {
  sno: string;
  description: string;
  hsnCode: string;
  qtyKgs: number;
  pcs: number;
  rateUSD: number;
  igstRate: number;
  batchNumber?: string;
  mfgDate?: string;
  expDate?: string;
  botanicalName?: string;
}

export interface ExporterDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  fax?: string;
  gstin: string;
  iec: string;
  bankName: string;
  accountNo: string;
}

export interface ConsigneeDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  buyerOrderNo: string;
  buyerOrderDate: string;
  exporter: ExporterDetails;
  consignee: ConsigneeDetails;
  buyer: string;
  countryOfOrigin: string;
  countryOfDestination: string;
  preCarriageBy: string;
  placeOfReceipt: string;
  termsOfDelivery: string;
  vesselFlightNo: string;
  portOfLoading: string;
  portOfDischarge: string;
  finalDestination: string;
  productDescription: string;
  currency: string;
  exchangeRate: number;
  items: InvoiceItem[];
  totalPcs: number;
  totalKgs: number;
  totalBoxes: number;
}

export interface ItemEnrichment {
  batchNumber: string;
  mfgDate: string;
  expDate: string;
  botanicalName: string;
}

export interface DocumentData {
  coa: string;  // Certificate of Analysis
  msds: string; // Material Safety Data Sheet
}

export interface ExtractedData {
  invoiceNumber?: string;
  invoiceDate?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  exporterName?: string;
  exporterAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  countryOrigin?: string;
  countryDestination?: string;
  currency?: string;
  exchangeRate?: number;
  termsOfDelivery?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  items?: Array<{
    description: string;
    hsnCode: string;
    qtyKgs: number;
    pcs: number;
    rateUSD: number;
  }>;
  totalPcs?: number;
  totalKgs?: number;
  totalBoxes?: number;
}
