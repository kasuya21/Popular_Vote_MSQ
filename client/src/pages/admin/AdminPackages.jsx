import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageSearch, Plus, Edit2, PackageX, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAdminPackages, createPackage, updatePackage, togglePackageActive } from '../../services/api';

const AdminPackages = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    voteAmount: '',
    isActive: true
  });

  // Queries
  const { data: packages = [], isLoading, isError } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: getAdminPackages
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      closeModal();
    }
  });

  const toggleMutation = useMutation({
    mutationFn: togglePackageActive,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      title: formData.title,
      price: Number(formData.price),
      voteAmount: Number(formData.voteAmount),
      isActive: formData.isActive
    };

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openModalForCreate = () => {
    setEditingPackage(null);
    setFormData({ title: '', price: '', voteAmount: '', isActive: true });
    setIsModalOpen(true);
  };

  const openModalForEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      price: pkg.price.toString(),
      voteAmount: pkg.voteAmount.toString(),
      isActive: pkg.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-[#d4af37]"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-rose-500">
        <AlertCircle size={48} className="mb-4" />
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))' }}>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-[#f5f5f5] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>จัดการแพ็กเกจโหวต</h1>
          <p className="text-[#a3a3a3]">ปรับแต่งราคาและคะแนนโหวตเพื่อดึงดูดผู้ใช้งาน</p>
        </div>
        <button 
          onClick={openModalForCreate}
          className="relative z-10 btn-primary-gradient text-[#050505] px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all duration-300 hover:opacity-90 group shadow-md"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> สร้างแพ็กเกจใหม่
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full bg-[#0a0a0a] rounded-3xl p-12 text-center border border-dashed border-[#d4af37]/30">
            <PackageSearch size={64} className="mx-auto text-[#d4af37]/50 mb-4" />
            <h3 className="text-xl font-bold text-[#f5f5f5] mb-2">ยังไม่มีแพ็กเกจ</h3>
            <p className="text-[#a3a3a3]">กดปุ่มสร้างแพ็กเกจใหม่เพื่อเริ่มต้น</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 border-2 ${
                pkg.isActive 
                  ? 'bg-[#0a0a0a] hover:border-[#d4af37]/50 border-[#d4af37]/20 shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:-translate-y-1' 
                  : 'bg-[#050505] border-[#a3a3a3]/20 border-dashed opacity-80 hover:opacity-100 grayscale-[0.2]'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-1 line-clamp-2 ${pkg.isActive ? 'text-[#f5f5f5]' : 'text-[#a3a3a3]'}`}>
                    {pkg.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-[#d4af37]/10 text-[#d4af37]">
                    ID: {pkg.id.substring(0,8)}
                  </div>
                </div>
                <button 
                  onClick={() => openModalForEdit(pkg)}
                  className="p-2.5 text-[#a3a3a3] hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-xl transition-all duration-300 bg-[#050505] ml-2 flex-shrink-0"
                  title="แก้ไข"
                >
                  <Edit2 size={18} />
                </button>
              </div>

              {/* Value Proposition */}
              <div className="mb-6 relative z-10">
                <div className="flex items-end gap-2">
                  <span className={`text-5xl font-black tracking-tight ${pkg.isActive ? 'text-[#d4af37]' : 'text-[#a3a3a3]'}`} style={{ fontFamily: "'Cinzel', serif" }}>
                    {pkg.voteAmount}
                  </span>
                  <span className={`font-medium mb-1.5 ${pkg.isActive ? 'text-[#d4af37]/70' : 'text-[#a3a3a3]'}`}>
                    โหวต
                  </span>
                </div>
              </div>

              {/* Price & Toggle */}
              <div className="flex items-center justify-between pt-5 border-t border-[#d4af37]/20 relative z-10">
                <div className="flex flex-col">
                  <span className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-0.5">ราคา</span>
                  <span className={`text-2xl font-bold flex items-center gap-1 ${pkg.isActive ? 'text-[#f5f5f5]' : 'text-[#a3a3a3]'}`}>
                    <span className="text-sm font-normal mt-1">฿</span>
                    {Number(pkg.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#a3a3a3] font-medium uppercase tracking-wider mb-1.5">สถานะ</span>
                  <button 
                    onClick={() => toggleMutation.mutate(pkg.id)}
                    disabled={toggleMutation.isPending}
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:ring-offset-2 ${
                      pkg.isActive ? 'bg-[#d4af37]' : 'bg-[#333]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#050505] shadow ring-0 transition duration-200 ease-in-out ${
                        pkg.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">
            <div className="px-6 py-5 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#050505]">
              <h3 className="text-xl font-extrabold text-[#f5f5f5]" style={{ fontFamily: "'Cinzel', serif" }}>
                {editingPackage ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}
              </h3>
              <button onClick={closeModal} className="text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors p-1">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#c0c0c0] mb-2">ชื่อแพ็กเกจ</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[#d4af37]/30 bg-[#050505] text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-all placeholder-[#a3a3a3]"
                    placeholder="เช่น แพ็กเกจสายเปย์"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#c0c0c0] mb-2">ราคา (บาท)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3]">฿</span>
                      <input 
                        type="number" 
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#d4af37]/30 bg-[#050505] text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-all placeholder-[#a3a3a3]"
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#c0c0c0] mb-2">คะแนนโหวต</label>
                    <input 
                      type="number" 
                      name="voteAmount"
                      value={formData.voteAmount}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 rounded-2xl border border-[#d4af37]/30 bg-[#050505] text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-all placeholder-[#a3a3a3]"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2">
                  <label className="flex items-center gap-4 p-4 rounded-2xl border border-[#d4af37]/20 bg-[#050505] cursor-pointer hover:bg-[#d4af37]/5 transition-colors">
                    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formData.isActive ? 'bg-[#d4af37]' : 'bg-[#333]'
                    }`}>
                      <input 
                        type="checkbox" 
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#050505] shadow ring-0 transition duration-200 ease-in-out ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#f5f5f5] block mb-0.5">เปิดใช้งานทันที</span>
                      <span className="text-xs text-[#a3a3a3]">แสดงในหน้าร้านค้าเพื่อให้ผู้ใช้ซื้อได้</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-2xl border border-[#d4af37]/30 text-[#c0c0c0] font-bold hover:bg-[#d4af37]/10 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-2xl btn-primary-gradient text-[#050505] font-bold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    'บันทึกข้อมูล'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
