import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CreditCard, AlertTriangle, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { getReconciliation, getRefunds } from '../../services/api';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('RECONCILIATION');

  const { data: reconciliationData, isLoading: isLoadingRecon } = useQuery({
    queryKey: ['reconciliation'],
    queryFn: getReconciliation,
    enabled: activeTab === 'RECONCILIATION'
  });

  const { data: refundsData = [], isLoading: isLoadingRefunds } = useQuery({
    queryKey: ['refunds'],
    queryFn: getRefunds,
    enabled: activeTab === 'REFUNDS'
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานและตรวจสอบ</h1>
          <p className="text-slate-500 text-sm mt-1">Reconciliation, การขอคืนเงิน และ Audit Logs</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('RECONCILIATION')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'RECONCILIATION' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2"><CreditCard size={18} /> ยอดกระทบยอด (Reconciliation)</div>
        </button>
        <button 
          onClick={() => setActiveTab('REFUNDS')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'REFUNDS' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2"><RotateCcw size={18} /> ประวัติการคืนเงิน (Refunds)</div>
        </button>
      </div>

      {activeTab === 'RECONCILIATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">สรุปการกระทบยอดระบบ (Mock PromptPay)</h3>
          
          {isLoadingRecon ? (
            <div className="flex justify-center py-10"><span className="loading loading-spinner text-violet-600"></span></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><FileText size={16} /> ออเดอร์ที่ชำระเงินแล้ว</p>
                <p className="text-3xl font-bold text-slate-800">{reconciliationData?.totalPaidOrders || 0}</p>
                <p className="text-sm text-slate-500 mt-2">ยอดรวม: ฿{(reconciliationData?.totalPaidAmount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Transaction ฝั่งระบบ Payment</p>
                <p className="text-3xl font-bold text-slate-800">{reconciliationData?.totalTransactions || 0}</p>
                <p className="text-sm text-slate-500 mt-2">ยอดรวม: ฿{(reconciliationData?.totalTransactionAmount || 0).toLocaleString()}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${reconciliationData?.discrepancyAmount === 0 ? 'bg-green-50 border-green-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${reconciliationData?.discrepancyAmount === 0 ? 'text-green-700' : 'text-rose-700'}`}>
                  <Activity size={16} /> ยอดต่าง (Discrepancy)
                </p>
                <p className={`text-3xl font-bold ${reconciliationData?.discrepancyAmount === 0 ? 'text-green-800' : 'text-rose-800'}`}>
                  ฿{(reconciliationData?.discrepancyAmount || 0).toLocaleString()}
                </p>
                <p className={`text-sm mt-2 ${reconciliationData?.discrepancyAmount === 0 ? 'text-green-600' : 'text-rose-600'}`}>
                  {reconciliationData?.discrepancyAmount === 0 ? 'ข้อมูลตรงกัน 100%' : 'พบข้อมูลที่ไม่ตรงกัน'}
                </p>
              </div>
            </div>
          )}
          
          <h4 className="font-bold text-slate-700 mb-4">รายการ Discrepancy ล่าสุด (ถ้ามี)</h4>
          <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500 border border-slate-100">
            <CheckCircle2 size={48} className="mx-auto text-green-300 mb-3" />
            <p className="font-medium text-slate-700">ไม่พบรายการที่ข้อมูลไม่ตรงกัน</p>
            <p className="text-sm mt-1">ระบบทำงานประสานกันได้อย่างสมบูรณ์</p>
          </div>
        </div>
      )}

      {activeTab === 'REFUNDS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg">ประวัติการขอคืนเงิน</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-medium">Transaction ID</th>
                  <th className="px-6 py-3 font-medium">ยอดเงิน</th>
                  <th className="px-6 py-3 font-medium">เหตุผล</th>
                  <th className="px-6 py-3 font-medium">สถานะ</th>
                  <th className="px-6 py-3 font-medium">เวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingRefunds ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      <span className="loading loading-spinner text-violet-500"></span>
                    </td>
                  </tr>
                ) : refundsData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                      <div className="flex flex-col items-center">
                        <RotateCcw size={32} className="text-slate-300 mb-2" />
                        <p>ไม่มีประวัติการขอคืนเงินในระบบ</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  refundsData.map(refund => (
                    <tr key={refund.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono">{refund.transaction.providerTransactionId}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">฿{Number(refund.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600">{refund.reason}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {refund.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(refund.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;
