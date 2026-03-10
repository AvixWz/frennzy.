import type { InquiryStatus, Prisma, UserRole } from "@prisma/client";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";

function normalizeSearch(search?: string) {
  const trimmed = search?.trim();
  return trimmed ? trimmed : undefined;
}

function countByLabel(values: string[]) {
  return Object.entries(
    values.reduce<Record<string, number>>((accumulator, value) => {
      if (!value) return accumulator;
      accumulator[value] = (accumulator[value] || 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function buildInquiryTrend(dates: Date[]) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const key = day.toISOString().slice(5, 10);
    return { label: key, value: 0 };
  });

  for (const date of dates) {
    const key = new Date(date).toISOString().slice(5, 10);
    const entry = days.find((item) => item.label === key);
    if (entry) {
      entry.value += 1;
    }
  }

  return days;
}

async function createUniqueSlug({
  base,
  exists,
  currentId
}: {
  base: string;
  exists: (slug: string) => Promise<string | undefined>;
  currentId?: string;
}) {
  const fallback = "item";
  const normalizedBase = base || fallback;

  let candidate = normalizedBase;
  let suffix = 2;

  while (true) {
    const existingId = await exists(candidate);
    if (!existingId || existingId === currentId) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

export async function getAdminStats() {
  const [inquiries, doctors, hospitals, treatments, blogPosts, recentLeads, inquiryRows, doctorRows, treatmentRows, recentAuditLogs] = await Promise.all([
    prisma.inquiry.count(),
    prisma.doctor.count(),
    prisma.hospital.count(),
    prisma.treatment.count(),
    prisma.blogPost.count(),
    prisma.inquiry.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.inquiry.findMany({ select: { status: true, createdAt: true } }),
    prisma.doctor.findMany({ select: { city: true } }),
    prisma.treatment.findMany({ select: { category: true } }),
    prisma.auditLog.findMany({ take: 12, orderBy: { createdAt: "desc" } })
  ]);

  return {
    inquiries,
    doctors,
    hospitals,
    treatments,
    blogPosts,
    recentLeads,
    inquiryStatusCounts: countByLabel(inquiryRows.map((item) => item.status)),
    inquiriesTrend: buildInquiryTrend(inquiryRows.map((item) => item.createdAt)),
    doctorCityCounts: countByLabel(doctorRows.map((item) => item.city)).slice(0, 6),
    treatmentCategoryCounts: countByLabel(treatmentRows.map((item) => item.category)).slice(0, 6),
    recentAuditLogs
  };
}

export async function listAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}

export async function listInquiries(search?: string, status?: InquiryStatus) {
  const normalizedSearch = normalizeSearch(search);

  return prisma.inquiry.findMany({
    where: {
      status,
      OR: normalizedSearch
        ? [
            { name: { contains: normalizedSearch } },
            { email: { contains: normalizedSearch } },
            { treatmentInterest: { contains: normalizedSearch } }
          ]
        : undefined
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateInquiry(
  id: string,
  payload: { status?: InquiryStatus; notes?: string }
) {
  return prisma.inquiry.update({
    where: { id },
    data: payload
  });
}

export async function listDoctors(search?: string) {
  return prisma.doctor.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { specialization: { contains: search } },
            { city: { contains: search } }
          ]
        }
      : undefined,
    include: { hospital: true, doctorTreatments: { include: { treatment: true } } },
    orderBy: { updatedAt: "desc" }
  });
}

type DoctorInput = {
  id?: string;
  name: string;
  specialization: string;
  experienceYears: number;
  city: string;
  imageUrl: string;
  googleReviewUrl?: string;
  websiteUrl?: string;
  hospitalId: string;
  languages: string[];
  education: string;
  certifications: string[];
  biography: string;
  patientReviews: Array<{ title: string; rating: number; text: string }>;
  consultationFee?: number | null;
  treatmentIds: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export async function saveDoctor(input: DoctorInput) {
  const slugBase = slugify(input.name, { lower: true, strict: true });
  const slug = await createUniqueSlug({
    base: slugBase,
    currentId: input.id,
    exists: async (candidate) => {
      const existing = await prisma.doctor.findUnique({ where: { slug: candidate }, select: { id: true } });
      return existing?.id;
    }
  });

  if (input.id) {
    await prisma.doctorTreatment.deleteMany({ where: { doctorId: input.id } });

    const updated = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        city: input.city,
        imageUrl: input.imageUrl,
        googleReviewUrl: input.googleReviewUrl,
        websiteUrl: input.websiteUrl,
        hospitalId: input.hospitalId,
        languages: input.languages,
        education: input.education,
        certifications: input.certifications,
        biography: input.biography,
        patientReviews: input.patientReviews,
        consultationFee: input.consultationFee,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        doctorTreatments: {
          createMany: {
            data: input.treatmentIds.map((treatmentId) => ({ treatmentId }))
          }
        }
      },
      include: { hospital: true, doctorTreatments: { include: { treatment: true } } }
    });

    return updated;
  }

  return prisma.doctor.create({
    data: {
      name: input.name,
      slug,
      specialization: input.specialization,
      experienceYears: input.experienceYears,
      city: input.city,
      imageUrl: input.imageUrl,
      googleReviewUrl: input.googleReviewUrl,
      websiteUrl: input.websiteUrl,
      hospitalId: input.hospitalId,
      languages: input.languages,
      education: input.education,
      certifications: input.certifications,
      biography: input.biography,
      patientReviews: input.patientReviews,
      consultationFee: input.consultationFee,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      doctorTreatments: {
        createMany: {
          data: input.treatmentIds.map((treatmentId) => ({ treatmentId }))
        }
      }
    },
    include: { hospital: true, doctorTreatments: { include: { treatment: true } } }
  });
}

export async function deleteDoctor(id: string) {
  await prisma.doctorTreatment.deleteMany({ where: { doctorId: id } });
  return prisma.doctor.delete({ where: { id } });
}

export async function listHospitals(search?: string) {
  return prisma.hospital.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { city: { contains: search } }
          ]
        }
      : undefined,
    include: { doctors: true, hospitalTreatments: { include: { treatment: true } } },
    orderBy: { updatedAt: "desc" }
  });
}

type HospitalInput = {
  id?: string;
  name: string;
  city: string;
  country: string;
  overview: string;
  googleReviewUrl?: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone: string;
  accreditations: string[];
  departments: string[];
  facilities: string[];
  images: string[];
  treatmentIds: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export async function saveHospital(input: HospitalInput) {
  const slugBase = slugify(`${input.name}-${input.city}`, { lower: true, strict: true });
  const slug = await createUniqueSlug({
    base: slugBase,
    currentId: input.id,
    exists: async (candidate) => {
      const existing = await prisma.hospital.findUnique({ where: { slug: candidate }, select: { id: true } });
      return existing?.id;
    }
  });

  if (input.id) {
    await prisma.hospitalTreatment.deleteMany({ where: { hospitalId: input.id } });

    return prisma.hospital.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug,
        city: input.city,
        country: input.country,
        overview: input.overview,
        googleReviewUrl: input.googleReviewUrl,
        websiteUrl: input.websiteUrl,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        accreditations: input.accreditations,
        departments: input.departments,
        facilities: input.facilities,
        images: input.images,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        hospitalTreatments: {
          createMany: {
            data: input.treatmentIds.map((treatmentId) => ({ treatmentId }))
          }
        }
      },
      include: { doctors: true, hospitalTreatments: { include: { treatment: true } } }
    });
  }

  return prisma.hospital.create({
    data: {
      name: input.name,
      slug,
      city: input.city,
      country: input.country,
      overview: input.overview,
      googleReviewUrl: input.googleReviewUrl,
      websiteUrl: input.websiteUrl,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      accreditations: input.accreditations,
      departments: input.departments,
      facilities: input.facilities,
      images: input.images,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      hospitalTreatments: {
        createMany: {
          data: input.treatmentIds.map((treatmentId) => ({ treatmentId }))
        }
      }
    },
    include: { doctors: true, hospitalTreatments: { include: { treatment: true } } }
  });
}

export async function deleteHospital(id: string) {
  await prisma.hospitalTreatment.deleteMany({ where: { hospitalId: id } });
  return prisma.hospital.delete({ where: { id } });
}

export async function listTreatments(search?: string) {
  return prisma.treatment.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { category: { contains: search } }
          ]
        }
      : undefined,
    include: {
      doctorTreatments: { include: { doctor: true } },
      hospitalTreatments: { include: { hospital: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

type TreatmentInput = {
  id?: string;
  name: string;
  category: string;
  images?: string[];
  procedure: string;
  recovery: string;
  costMin: number;
  costMax: number;
  currency: string;
  faqs: Array<{ question: string; answer: string }>;
  doctorIds: string[];
  hospitalIds: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export async function saveTreatment(input: TreatmentInput) {
  const slugBase = slugify(input.name, { lower: true, strict: true });
  const slug = await createUniqueSlug({
    base: slugBase,
    currentId: input.id,
    exists: async (candidate) => {
      const existing = await prisma.treatment.findUnique({ where: { slug: candidate }, select: { id: true } });
      return existing?.id;
    }
  });

  if (input.id) {
    await prisma.doctorTreatment.deleteMany({ where: { treatmentId: input.id } });
    await prisma.hospitalTreatment.deleteMany({ where: { treatmentId: input.id } });

    return prisma.treatment.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug,
        category: input.category,
        images: input.images,
        procedure: input.procedure,
        recovery: input.recovery,
        costMin: input.costMin,
        costMax: input.costMax,
        currency: input.currency,
        faqs: input.faqs,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        doctorTreatments: {
          createMany: {
            data: input.doctorIds.map((doctorId) => ({ doctorId }))
          }
        },
        hospitalTreatments: {
          createMany: {
            data: input.hospitalIds.map((hospitalId) => ({ hospitalId }))
          }
        }
      },
      include: {
        doctorTreatments: { include: { doctor: true } },
        hospitalTreatments: { include: { hospital: true } }
      }
    });
  }

  return prisma.treatment.create({
    data: {
      name: input.name,
      slug,
      category: input.category,
      images: input.images,
      procedure: input.procedure,
      recovery: input.recovery,
      costMin: input.costMin,
      costMax: input.costMax,
      currency: input.currency,
      faqs: input.faqs,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      doctorTreatments: {
        createMany: {
          data: input.doctorIds.map((doctorId) => ({ doctorId }))
        }
      },
      hospitalTreatments: {
        createMany: {
          data: input.hospitalIds.map((hospitalId) => ({ hospitalId }))
        }
      }
    },
    include: {
      doctorTreatments: { include: { doctor: true } },
      hospitalTreatments: { include: { hospital: true } }
    }
  });
}

export async function deleteTreatment(id: string) {
  await prisma.doctorTreatment.deleteMany({ where: { treatmentId: id } });
  await prisma.hospitalTreatment.deleteMany({ where: { treatmentId: id } });
  return prisma.treatment.delete({ where: { id } });
}

export async function listBlogPosts(search?: string) {
  return prisma.blogPost.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search } },
            { category: { contains: search } }
          ]
        }
      : undefined,
    orderBy: { updatedAt: "desc" }
  });
}

type BlogInput = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  authorName: string;
  authorTitle: string;
  published: boolean;
  publishedAt?: string;
  schemaType?: string;
  readTimeMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
  openGraphImage?: string;
};

export async function saveBlogPost(input: BlogInput) {
  const slugBase = slugify(input.title, { lower: true, strict: true });
  const slug = await createUniqueSlug({
    base: slugBase,
    currentId: input.id,
    exists: async (candidate) => {
      const existing = await prisma.blogPost.findUnique({ where: { slug: candidate }, select: { id: true } });
      return existing?.id;
    }
  });

  const baseData: Prisma.BlogPostUncheckedCreateInput = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    featuredImage: input.featuredImage,
    category: input.category,
    tags: input.tags,
    authorName: input.authorName,
    authorTitle: input.authorTitle,
    published: input.published,
    publishedAt: input.published ? new Date(input.publishedAt ?? Date.now()) : null,
    schemaType: input.schemaType ?? "Article",
    readTimeMinutes: input.readTimeMinutes ?? 6,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    openGraphImage: input.openGraphImage
  };

  if (input.id) {
    return prisma.blogPost.update({
      where: { id: input.id },
      data: baseData
    });
  }

  return prisma.blogPost.create({ data: baseData });
}

export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}

export async function listTestimonials(search?: string) {
  return prisma.testimonial.findMany({
    where: search
      ? {
          OR: [
            { patientName: { contains: search } },
            { treatment: { contains: search } },
            { country: { contains: search } }
          ]
        }
      : undefined,
    include: {
      doctor: true,
      treatmentRef: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

type TestimonialInput = {
  id?: string;
  patientName: string;
  country: string;
  city?: string;
  treatment: string;
  comment: string;
  rating: number;
  imageUrl?: string;
  isPublished: boolean;
  doctorId?: string;
  treatmentId?: string;
};

export async function saveTestimonial(input: TestimonialInput) {
  if (input.id) {
    return prisma.testimonial.update({
      where: { id: input.id },
      data: input
    });
  }

  return prisma.testimonial.create({ data: input });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

export async function listReferenceData() {
  const [hospitals, doctors, treatments] = await Promise.all([
    prisma.hospital.findMany({ select: { id: true, name: true } }),
    prisma.doctor.findMany({ select: { id: true, name: true } }),
    prisma.treatment.findMany({ select: { id: true, name: true } })
  ]);

  return {
    hospitals,
    doctors,
    treatments
  };
}

export function hasRole(role: UserRole, required: UserRole) {
  if (required === "EDITOR") {
    return role === "EDITOR" || role === "ADMIN";
  }
  return role === "ADMIN";
}








