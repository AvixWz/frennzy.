import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

interface BuildMetadataInput {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}

export function buildMetadata({ title, description, path = "/", image }: BuildMetadataInput): Metadata {
  const resolvedDescription = description ?? SITE_DESCRIPTION;
  const url = new URL(path, SITE_URL).toString();
  const ogImage = image ?? `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description: resolvedDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title,
      description: resolvedDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [ogImage]
    }
  };
}

export function buildJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data);
}
