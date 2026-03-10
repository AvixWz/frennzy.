import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [treatments, doctors, hospitals, blogs] = await Promise.all([
    prisma.treatment.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.doctor.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.hospital.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/treatments",
    "/doctors",
    "/hospitals",
    "/blog",
    "/testimonials",
    "/contact"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...treatments.map((item) => ({
      url: `${baseUrl}/treatments/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...doctors.map((item) => ({
      url: `${baseUrl}/doctors/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...hospitals.map((item) => ({
      url: `${baseUrl}/hospitals/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    })),
    ...blogs.map((item) => ({
      url: `${baseUrl}/blog/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
