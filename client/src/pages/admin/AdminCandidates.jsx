import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Ban, CheckCircle2, MoreVertical, X, Save, Upload, Trash2 } from 'lucide-react';
import { getAdminCandidates, createCandidate, updateCandidate, deleteCandidate, uploadImage } from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUtils';
import ImageWithRetry from '../../components/ImageWithRetry';

const initialForm = {
  candidateNumber: '',
  category: 'STAR',
  nickname: '',
  faculty: '',
  profileImage: ''
};

const AdminCandidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: getAdminCandidates
  });

  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
      setIsModalOpen(false);
      setFormData(initialForm);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
      setIsModalOpen(false);
      setFormData(initialForm);
      setIsEditing(false);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
    }
  });

  const filteredCandidates = candidates.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.nickname?.toLowerCase().includes(term) ||
           c.candidateNumber?.toLowerCase().includes(term) ||
           c.faculty?.toLowerCase().includes(term);
  });

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (candidate) => {
    setFormData({
      candidateNumber: candidate.candidateNumber,
      category: candidate.category,
      nickname: candidate.nickname,
      faculty: candidate.faculty || '',
      profileImage: candidate.profileImage || ''
    });
    setEditingId(candidate.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('คุณต้องการลบผู้สมัครรายนี้ใช่หรือไม่?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = {
      ...formData,
      candidateNumber: String(formData.candidateNumber).trim()
    };
    // ลบ field ที่เป็นค่าว่างออกก่อนส่ง เพื่อให้ Zod ไม่ validate fields ที่ไม่จำเป็น
    const data = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    if (isEditing) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setFormData({ ...formData, profileImage: url });
    } catch (err) {
      alert('อัปโหลดรูปล้มเหลว: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f5]">จัดการผู้สมัคร</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">เพิ่ม แก้ไข และจัดการสถานะผู้สมัครทั้งหมด</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary-gradient px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md text-[#050505] hover:opacity-90"
        >
          <Plus size={18} /> เพิ่มผู้สมัคร
        </button>
      </div>

      <div className="rounded-2xl border border-[#d4af37]/20 shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))' }}>
        <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, หมายเลข, สาขา..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d4af37]/30 bg-[#050505] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 text-sm text-[#f5f5f5] placeholder-slate-600"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050505]/50 text-[#a3a3a3] text-xs uppercase tracking-wider border-b border-[#d4af37]/20">
                <th className="px-6 py-3 font-medium">รูป/ชื่อ</th>
                <th className="px-6 py-3 font-medium">ประเภท</th>
                <th className="px-6 py-3 font-medium">คะแนนโหวต</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#a3a3a3]">
                    <span className="loading loading-spinner loading-md text-[#d4af37]"></span>
                  </td>
                </tr>
              ) : filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-[#d4af37]/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithRetry 
                        src={resolveImageUrl(candidate.profileImage)} 
                        alt={candidate.nickname} 
                        className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/30" 
                        fallback="https://placehold.co/40x40/1a1730/e8dfc8?text=?" 
                      />
                      <div>
                        <p className="font-bold text-[#f5f5f5]">{candidate.nickname}</p>
                        <p className="text-xs text-[#c0c0c0]">No. {candidate.candidateNumber} • {candidate.faculty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${candidate.category === 'STAR' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 
                        candidate.category === 'MOON' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'}
                    `}>
                      {candidate.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#d4af37]">
                    {candidate.voteCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {candidate.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 size={14} /> ใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#a3a3a3] text-xs font-medium">
                        <Ban size={14} /> ปิดใช้งาน
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-[#a3a3a3]">
                      <button onClick={() => handleOpenEdit(candidate)} className="p-1.5 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md transition-colors" title="แก้ไข">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(candidate.id)} className="p-1.5 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors" title="ลบ">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#a3a3a3]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#050505]">
              <h2 className="text-xl font-bold text-[#f5f5f5]">{isEditing ? 'แก้ไขข้อมูลผู้สมัคร' : 'เพิ่มผู้สมัครใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <form id="candidate-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#c0c0c0] mb-1">หมายเลข (No.)</label>
                    <input type="text" required value={formData.candidateNumber} onChange={e => setFormData({...formData, candidateNumber: e.target.value})} className="w-full px-3 py-2 bg-[#050505] border border-[#d4af37]/30 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#c0c0c0] mb-1">ประเภท</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-[#050505] border border-[#d4af37]/30 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50">
                      <option value="STAR">STAR</option>
                      <option value="MOON">MOON</option>
                      <option value="QUEEN">QUEEN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#c0c0c0] mb-1">ชื่อเล่น</label>
                    <input type="text" required value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="w-full px-3 py-2 bg-[#050505] border border-[#d4af37]/30 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#c0c0c0] mb-1">สาขา</label>
                    <input type="text" required value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} className="w-full px-3 py-2 bg-[#050505] border border-[#d4af37]/30 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#c0c0c0] mb-1">รูปภาพ (อัปโหลด หรือใส่ลิงก์)</label>
                    <div className="flex gap-2">
                      <input type="url" placeholder="https://..." value={formData.profileImage} onChange={e => setFormData({...formData, profileImage: e.target.value})} className="flex-1 px-3 py-2 bg-[#050505] border border-[#d4af37]/30 rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50" />
                      <label className={`cursor-pointer px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-lg text-[#d4af37] font-medium hover:bg-[#d4af37]/30 transition flex items-center justify-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploading ? <span className="loading loading-spinner loading-sm"></span> : <Upload size={18} />}
                        <span>อัปโหลด</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    </div>
                    {(formData.profileImage && formData.profileImage.length > 20) && (
                      <div className="mt-4 flex justify-center bg-[#050505] p-3 rounded-lg border border-[#d4af37]/10">
                        <ImageWithRetry 
                          src={resolveImageUrl(formData.profileImage)} 
                          alt="Preview" 
                          className="h-40 w-32 rounded-lg object-cover border border-[#d4af37]/30 shadow-lg"
                          fallback="https://placehold.co/300x400/1a1730/e8dfc8?text=Error"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-[#d4af37]/20 bg-[#050505] flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-[#c0c0c0] hover:bg-[#d4af37]/10 transition-colors font-medium">
                ยกเลิก
              </button>
              <button type="submit" form="candidate-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2 rounded-lg btn-primary-gradient text-[#050505] font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
                {(createMutation.isPending || updateMutation.isPending) ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidates;
