const { z } = require('zod');

// Authentication Schemas
const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

// Candidate Schemas
const createCandidateSchema = z.object({
  body: z.object({
    candidateNumber: z.string().min(1),
    category: z.enum(['STAR', 'MOON', 'QUEEN']),
    nickname: z.string().min(1, 'Nickname is required'),
    prefix: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    studentId: z.string().optional(),
    faculty: z.string().min(1, 'Faculty is required'),
    major: z.string().optional(),
    year: z.number().int().optional(),
    classRoom: z.string().optional(),
    bio: z.string().optional(),
    talent: z.string().optional(),
    motto: z.string().optional(),
    socialInstagram: z.string().optional(),
    socialFacebook: z.string().optional(),
    socialTiktok: z.string().optional(),
    profileImage: z.string().optional(),
    coverImage: z.string().optional(),
    galleryImages: z.any().optional(), // JSON array
    introVideoUrl: z.string().url().optional().or(z.literal('')),
    displayOrder: z.number().int().default(0),
    isActive: z.boolean().default(true)
  })
});

const updateCandidateSchema = z.object({
  body: createCandidateSchema.shape.body.partial()
});

// Vote Package Schemas
const createPackageSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    price: z.number().positive(),
    voteAmount: z.number().int().positive(),
    isActive: z.boolean().default(true)
  })
});

const updatePackageSchema = z.object({
  body: createPackageSchema.shape.body.partial()
});

// Order & Payment Schemas
const createOrderSchema = z.object({
  body: z.object({
    candidateId: z.string().uuid(),
    packageId: z.string().uuid(),
    customerName: z.string().optional(),
    customerContact: z.string().email('กรุณาระบุอีเมลที่ถูกต้องเพื่อรับใบเสร็จ')
  })
});

// Admin Review schemas
const updatePaymentNoteSchema = z.object({
  body: z.object({
    internalNote: z.string()
  })
});

const processRefundSchema = z.object({
  body: z.object({
    reason: z.string().min(5, 'Reason is required')
  })
});

module.exports = {
  adminLoginSchema,
  createCandidateSchema,
  updateCandidateSchema,
  createPackageSchema,
  updatePackageSchema,
  createOrderSchema,
  updatePaymentNoteSchema,
  processRefundSchema
};
