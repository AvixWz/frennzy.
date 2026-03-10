import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendInquiryNotification } from "@/lib/services/email-service";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(120),
  treatmentInterest: z.string().trim().min(2).max(120),
  message: z.string().trim().max(2000).optional().default(""),
  website: z.string().trim().max(200).optional().default("")
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export async function createInquiry(payload: unknown) {
  const data = inquirySchema.parse(payload);
  const message = data.message || `Requesting consultation for ${data.treatmentInterest}.`;

  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      country: data.country,
      phone: data.phone,
      email: data.email,
      treatmentInterest: data.treatmentInterest,
      message
    }
  });

  await sendInquiryNotification(inquiry);
  return inquiry;
}
