'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Download, Eye, Search, FileText, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthUser } from '@/lib/types/auth';
import { Invoice } from '@/lib/types/invoice';

export default function LogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [logs, setLogs] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fetchLogs = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/logs?userId=${userId}&page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      fetchLogs(session.user.id);
    };

    checkAuth();
  }, [router, fetchLogs]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} onToggle={setIsSidebarCollapsed} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Top Bar for Mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-900">Invoice History</h2>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                    Invoice History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Total {total} invoice{total !== 1 ? 's' : ''} generated
                  </p>
                </div>

                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 w-full sm:w-80 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center py-12 sm:py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-sm sm:text-base text-gray-600">Loading invoices...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg font-medium">
                    {search ? 'No invoices found' : 'No invoices generated yet'}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">
                    {search ? 'Try a different search term' : 'Start by creating your first invoice'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {log.invoice_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(log.invoice_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                  {log.consignee_name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {log.items?.length || 0} item{log.items?.length !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                <div>{log.total_pcs} pcs</div>
                                <div className="text-xs text-gray-500">{log.total_kgs} kg</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                {log.excel_link && (
                                  <a
                                    href={log.excel_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Download Excel"
                                  >
                                    <Download className="w-5 h-5" />
                                  </a>
                                )}
                                {log.pdf_link && (
                                  <a
                                    href={log.pdf_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="View PDF"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Cards */}
                  <div className="lg:hidden space-y-3 sm:space-y-4">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {log.invoice_number}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>{new Date(log.invoice_date).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {log.excel_link && (
                              <a
                                href={log.excel_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            {log.pdf_link && (
                              <a
                                href={log.pdf_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 bg-green-50 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm">
                          <p className="text-gray-700 flex items-center gap-2 truncate">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{log.consignee_name}</span>
                          </p>
                          <p className="text-gray-600">
                            {log.total_pcs} pcs • {log.total_kgs} kg • {log.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
