import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/documents/", "/settings/", "/view/"],
      },
    ],
    sitemap: "https://peeeky.com/sitemap.xml",
  };
}
