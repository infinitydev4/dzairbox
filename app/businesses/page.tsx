import type { Metadata } from "next";
import localFont from "next/font/local";
import { DirectoryExperience } from "@/components/directory/experience";
import { searchDirectory } from "@/lib/studio/directory";
import "../home.css";
import "../studio.css";
import "../directory.css";
const display = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-home-display",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Professionnels et services locaux en Algérie",
  description:
    "Cherchez un professionnel par métier, wilaya et commune. Découvrez ses services et contactez-le directement.",
  alternates: { canonical: "/businesses" },
};
export const dynamic = "force-dynamic";
export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(values))
    if (typeof value === "string") query[key] = value;
  let result;
  let error = false;
  try {
    result = await searchDirectory(new URLSearchParams(query));
  } catch {
    error = true;
    result = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      pages: 1,
      markers: [],
      mapLimited: false,
    };
  }
  return (
    <div className={display.variable}>
      <DirectoryExperience
        key={JSON.stringify(query)}
        result={result}
        query={query}
        error={error}
      />
    </div>
  );
}
