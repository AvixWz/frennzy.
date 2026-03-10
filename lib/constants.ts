export const SITE_NAME = "Mediway";
export const SITE_DESCRIPTION =
  "Mediway connects international patients with accredited hospitals, leading doctors, and complete medical tourism support in India.";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const BRAND_COLORS = {
  lightBg: "#FFFFFF",
  darkText: "#0F172A",
  darkBg: "#0F172A",
  darkCard: "#1E293B",
  lightText: "#E2E8F0",
  primary: "#2563EB",
  secondary: "#14B8A6"
};

export const ADMIN_COOKIE_NAME = "mediway_admin_token";

export const ADMIN_SECTIONS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/hospitals", label: "Hospitals" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/treatments", label: "Treatments" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/reviews", label: "Reviews" }
] as const;
