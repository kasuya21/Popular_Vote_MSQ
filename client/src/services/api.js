import api from '../lib/axios';

// --- PUBLIC APIs ---

export const getCandidates = async () => {
  const { data } = await api.get('/public/candidates');
  return data.data; 
};

export const getCandidateById = async (id) => {
  const { data } = await api.get(`/public/candidates/${id}`);
  return data.data;
};

export const getRankings = async (category) => {
  const url = category ? `/public/rankings?category=${category}` : '/public/rankings';
  const { data } = await api.get(url);
  return data.data;
};

export const getVotePackages = async () => {
  const { data } = await api.get('/public/vote-packages');
  return data.data;
};

export const createOrder = async (orderData) => {
  const { data } = await api.post('/public/orders', orderData);
  return data.data;
};

export const getOrderByNo = async (orderNo) => {
  const { data } = await api.get(`/public/orders/${orderNo}`);
  return data.data;
};

export const checkPaymentStatus = async (orderNo) => {
  return getOrderByNo(orderNo);
};

export const trackOrder = async (orderNo, contactInfo) => {
  const { data } = await api.get(`/public/orders/${orderNo}`);
  return data.data;
};

export const getOrdersByEmail = async (email) => {
  const { data } = await api.get('/public/orders/by-email', { params: { email } });
  return data.data;
};

// DEV ONLY: trigger mock webhook
export const triggerMockWebhook = async (providerReference, amount) => {
  const { data } = await api.post('/public/payments/mock-webhook', { providerReference, amount });
  return data;
};

// --- ADMIN APIs ---

export const loginAdmin = async (email, password) => {
  const { data } = await api.post('/admin/auth/login', { email, password });
  return data.data;
};

export const logoutAdmin = async () => {
  const { data } = await api.post('/admin/auth/logout');
  return data.data;
};

export const getMe = async () => {
  const { data } = await api.get('/admin/auth/me');
  return data.data;
};

export const getAdminCandidates = async () => {
  const { data } = await api.get('/admin/candidates');
  return data.data;
};

export const createCandidate = async (candidateData) => {
  const { data } = await api.post('/admin/candidates', candidateData);
  return data.data;
};

export const updateCandidate = async (id, candidateData) => {
  const { data } = await api.patch(`/admin/candidates/${id}`, candidateData);
  return data.data;
};

export const deleteCandidate = async (id) => {
  const { data } = await api.delete(`/admin/candidates/${id}`);
  return data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/admin/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.url;
};

export const getAdminPayments = async () => {
  const { data } = await api.get('/admin/payments');
  return data.data;
};

export const deleteAdminPayment = async (orderNo) => {
  const { data } = await api.delete(`/admin/orders/${orderNo}`);
  return data;
};

export const getAdminPackages = async () => {
  const { data } = await api.get('/admin/vote-packages');
  return data.data;
};

export const createPackage = async (packageData) => {
  const { data } = await api.post('/admin/vote-packages', packageData);
  return data.data;
};

export const updatePackage = async (id, packageData) => {
  const { data } = await api.patch(`/admin/vote-packages/${id}`, packageData);
  return data.data;
};

export const togglePackageActive = async (id) => {
  const { data } = await api.patch(`/admin/vote-packages/${id}/toggle-active`);
  return data.data;
};

export const getPaymentDetail = async (orderNo) => {
  const { data } = await api.get(`/admin/payments/${orderNo}`);
  return data.data;
};

export const getReconciliation = async () => {
  const { data } = await api.get('/admin/payments/reconciliation');
  return data.data;
};

export const getRefunds = async () => {
  const { data } = await api.get('/admin/refunds');
  return data.data;
};

// Manual Slip Approval
export const uploadSlip = async (orderNo, file) => {
  const formData = new FormData();
  formData.append('slip', file);
  const { data } = await api.post(`/public/orders/${orderNo}/upload-slip`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.data;
};

export const approveSlip = async (orderNo) => {
  const { data } = await api.post(`/admin/orders/${orderNo}/approve`);
  return data;
};

export const rejectSlip = async (orderNo, reason) => {
  const { data } = await api.post(`/admin/orders/${orderNo}/reject`, { reason });
  return data;
};

export const createPOSOrder = async (orderData) => {
  const { data } = await api.post('/admin/orders/pos', orderData);
  return data;
};

// --- SETTINGS APIs ---

export const getSystemSettings = async () => {
  const { data } = await api.get('/settings');
  return data;
};

export const updateSystemSettings = async (settings) => {
  const { data } = await api.put('/settings', settings);
  return data;
};
