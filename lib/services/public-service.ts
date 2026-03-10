import type { BlogPost, Doctor, Hospital, Prisma, Testimonial, Treatment } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const doctorInclude = {
  hospital: true,
  doctorTreatments: {
    include: {
      treatment: true
    }
  }
} satisfies Prisma.DoctorInclude;

const treatmentInclude = {
  doctorTreatments: {
    include: {
      doctor: {
        include: {
          hospital: true
        }
      }
    }
  },
  hospitalTreatments: {
    include: {
      hospital: true
    }
  }
} satisfies Prisma.TreatmentInclude;

const hospitalInclude = {
  doctors: true,
  hospitalTreatments: {
    include: {
      treatment: true
    }
  }
} satisfies Prisma.HospitalInclude;

function normalizeFilter(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

export async function getHomepageData() {
  const [treatments, doctors, hospitals, testimonials, blogs] = await Promise.all([
    prisma.treatment.findMany({ take: 6, orderBy: { updatedAt: "desc" } }),
    prisma.doctor.findMany({ take: 6, include: { hospital: true }, orderBy: { experienceYears: "desc" } }),
    prisma.hospital.findMany({ take: 6, include: { doctors: true }, orderBy: { updatedAt: "desc" } }),
    prisma.testimonial.findMany({ where: { isPublished: true }, take: 6, orderBy: { createdAt: "desc" } }),
    prisma.blogPost.findMany({ where: { published: true }, take: 3, orderBy: { publishedAt: "desc" } })
  ]);

  return { treatments, doctors, hospitals, testimonials, blogs };
}

type TreatmentSort = "name_asc" | "name_desc" | "cost_low_to_high" | "cost_high_to_low" | "recent";

interface TreatmentFilter {
  q?: string;
  category?: string;
  city?: string;
  sort?: TreatmentSort;
}

function getTreatmentOrderBy(sort: TreatmentSort | undefined): Prisma.TreatmentOrderByWithRelationInput[] {
  switch (sort) {
    case "name_desc":
      return [{ name: "desc" }];
    case "cost_low_to_high":
      return [{ costMin: "asc" }, { name: "asc" }];
    case "cost_high_to_low":
      return [{ costMax: "desc" }, { name: "asc" }];
    case "recent":
      return [{ updatedAt: "desc" }];
    case "name_asc":
    default:
      return [{ name: "asc" }];
  }
}

export async function getTreatmentList(filters: TreatmentFilter = {}) {
  const q = normalizeFilter(filters.q);
  const category = normalizeFilter(filters.category);
  const city = normalizeFilter(filters.city);

  const where: Prisma.TreatmentWhereInput = {
    category: category ? { contains: category } : undefined,
    hospitalTreatments: city
      ? {
          some: {
            hospital: {
              city: { contains: city }
            }
          }
        }
      : undefined,
    OR: q
      ? [
          { name: { contains: q } },
          { category: { contains: q } },
          { procedure: { contains: q } }
        ]
      : undefined
  };

  return prisma.treatment.findMany({
    include: treatmentInclude,
    where,
    orderBy: getTreatmentOrderBy(filters.sort)
  });
}

export async function getTreatmentBySlug(slug: string) {
  return prisma.treatment.findUnique({
    where: { slug },
    include: treatmentInclude
  });
}

interface DoctorFilter {
  q?: string;
  specialization?: string;
  hospitalId?: string;
  city?: string;
  minExperience?: number;
  sort?: "experience_desc" | "experience_asc" | "name_asc" | "name_desc";
}

function getDoctorOrderBy(sort: DoctorFilter["sort"]): Prisma.DoctorOrderByWithRelationInput[] {
  switch (sort) {
    case "experience_asc":
      return [{ experienceYears: "asc" }, { name: "asc" }];
    case "name_asc":
      return [{ name: "asc" }];
    case "name_desc":
      return [{ name: "desc" }];
    case "experience_desc":
    default:
      return [{ experienceYears: "desc" }, { name: "asc" }];
  }
}

export async function getDoctorList(filters: DoctorFilter = {}) {
  const q = normalizeFilter(filters.q);
  const specialization = normalizeFilter(filters.specialization);
  const city = normalizeFilter(filters.city);

  return prisma.doctor.findMany({
    where: {
      specialization: specialization
        ? {
            contains: specialization
          }
        : undefined,
      hospitalId: filters.hospitalId,
      city: city
        ? {
            contains: city
          }
        : undefined,
      experienceYears: filters.minExperience ? { gte: filters.minExperience } : undefined,
      OR: q
        ? [
            { name: { contains: q } },
            { specialization: { contains: q } },
            { city: { contains: q } },
            { hospital: { name: { contains: q } } }
          ]
        : undefined
    },
    include: doctorInclude,
    orderBy: getDoctorOrderBy(filters.sort)
  });
}

export async function getDoctorBySlug(slug: string) {
  return prisma.doctor.findUnique({
    where: { slug },
    include: doctorInclude
  });
}

interface HospitalFilter {
  q?: string;
  city?: string;
  specialty?: string;
  sort?: "name_asc" | "name_desc" | "doctors_desc" | "recent";
}

export async function getHospitalList(filters: HospitalFilter = {}) {
  const q = normalizeFilter(filters.q);
  const city = normalizeFilter(filters.city);
  const specialty = normalizeFilter(filters.specialty)?.toLowerCase();

  let hospitals = await prisma.hospital.findMany({
    include: hospitalInclude,
    where: {
      city: city
        ? {
            contains: city
          }
        : undefined,
      OR: q
        ? [
            { name: { contains: q } },
            { city: { contains: q } },
            { country: { contains: q } },
            { overview: { contains: q } }
          ]
        : undefined
    },
    orderBy:
      filters.sort === "name_desc" ? { name: "desc" } : filters.sort === "recent" ? { updatedAt: "desc" } : { name: "asc" }
  });

  const normalizedQ = q?.toLowerCase();

  if (specialty || normalizedQ) {
    hospitals = hospitals.filter((hospital) => {
      const departments = readStringArray(hospital.departments).map((department) => department.toLowerCase());
      const matchesSpecialty = !specialty || departments.some((department) => department.includes(specialty));
      const matchesDepartmentQuery = !normalizedQ || departments.some((department) => department.includes(normalizedQ));
      const matchesTextQuery =
        !normalizedQ ||
        [hospital.name, hospital.city, hospital.country, hospital.overview].some((value) =>
          value.toLowerCase().includes(normalizedQ)
        );

      return matchesSpecialty && (matchesTextQuery || matchesDepartmentQuery);
    });
  }

  if (filters.sort === "doctors_desc") {
    return hospitals.sort((a, b) => b.doctors.length - a.doctors.length || a.name.localeCompare(b.name));
  }

  return hospitals;
}

export async function getHospitalBySlug(slug: string) {
  return prisma.hospital.findUnique({
    where: { slug },
    include: hospitalInclude
  });
}

interface BlogFilter {
  q?: string;
  category?: string;
  tag?: string;
  sort?: "latest" | "oldest" | "title_asc";
}

export async function getBlogList(filters: BlogFilter = {}) {
  const q = normalizeFilter(filters.q);
  const category = normalizeFilter(filters.category);

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      category: category
        ? {
            contains: category
          }
        : undefined,
      OR: q
        ? [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { content: { contains: q } }
          ]
        : undefined
    },
    orderBy:
      filters.sort === "oldest"
        ? [{ publishedAt: "asc" }, { createdAt: "asc" }]
        : filters.sort === "title_asc"
          ? [{ title: "asc" }]
          : [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  const tag = normalizeFilter(filters.tag);
  if (!tag) {
    return posts;
  }

  const targetTag = tag.toLowerCase();
  return posts.filter((post) => (post.tags as string[]).some((postTag) => postTag.toLowerCase() === targetTag));
}

export async function getBlogBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, published: true }
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    include: {
      doctor: true,
      treatmentRef: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPublicStats() {
  const [inquiries, doctors, hospitals, blogPosts] = await Promise.all([
    prisma.inquiry.count(),
    prisma.doctor.count(),
    prisma.hospital.count(),
    prisma.blogPost.count({ where: { published: true } })
  ]);

  return { inquiries, doctors, hospitals, blogPosts };
}

export async function getInquiryStatuses() {
  return ["NEW", "CONTACTED", "REVIEWING", "CLOSED"] as const;
}

export type PublicTreatment = Treatment;
export type PublicDoctor = Doctor;
export type PublicHospital = Hospital;
export type PublicBlogPost = BlogPost;
export type PublicTestimonial = Testimonial;
