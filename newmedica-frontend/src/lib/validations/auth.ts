import { z } from 'zod';

const UserTypeEnum = z.enum(['Basic', 'Agent', 'Healthcare']);

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const baseRegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  userType: UserTypeEnum,
  firstName: z.string().min(1, { message: 'First name is required' }),
  // Optional fields that will be validated by superRefine
  icNo: z.string().optional(),
  hpNo: z.string().optional(),
  hospitalName: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  coRegNo: z.string().optional(),
  coEmailAddress: z.string().optional(),
  tinNo: z.string().optional(),
  picEinvoice: z.string().optional(),
  picEinvoiceEmail: z.string().optional(),
  picEinvoiceTelNo: z.string().optional(),
});

export const registerSchema = baseRegisterSchema
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ['confirmPassword'],
      });
    }

    if (data.userType === 'Healthcare') {
      const requiredFields: (keyof typeof data)[] = ['icNo', 'hpNo', 'hospitalName', 'department', 'position'];
      let hasMissingField = false;
      for (const field of requiredFields) {
        if (!data[field]) {
          hasMissingField = true;
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This field is required',
            path: [field],
          });
        }
      }
      if (hasMissingField) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'All healthcare fields are required', path: ['_healthcareError'] });
      }
    }

    if (data.userType === 'Agent') {
      const requiredFields: (keyof typeof data)[] = ['icNo', 'hpNo', 'companyName', 'companyAddress', 'coRegNo', 'coEmailAddress', 'tinNo', 'picEinvoice', 'picEinvoiceEmail', 'picEinvoiceTelNo'];
      let hasMissingField = false;
      for (const field of requiredFields) {
        if (!data[field]) {
          hasMissingField = true;
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This field is required',
            path: [field],
          });
        }
      }
      if (data.coEmailAddress && !z.string().email().safeParse(data.coEmailAddress).success) {
        hasMissingField = true;
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid company email', path: ['coEmailAddress'] });
      }
      if (data.picEinvoiceEmail && !z.string().email().safeParse(data.picEinvoiceEmail).success) {
        hasMissingField = true;
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid PIC email', path: ['picEinvoiceEmail'] });
      }
      if (hasMissingField) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'All agent fields are required', path: ['_agentError'] });
      }
    }
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;