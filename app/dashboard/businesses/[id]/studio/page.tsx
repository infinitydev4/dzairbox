import type { Metadata } from "next";
import localFont from "next/font/local";
import { StudioEditor } from "@/components/studio/editor";
import "@/app/home.css";
import "@/app/studio.css";
const display = localFont({
  src: "../../../../fonts/GeistVF.woff",
  variable: "--font-home-display",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Studio business",
  robots: { index: false, follow: false },
};
export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className={display.variable}>
      <StudioEditor businessId={(await params).id} />
    </div>
  );
}
