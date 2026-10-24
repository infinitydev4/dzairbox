"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { StudioCanvas } from "./canvas";
import { trackEvent } from "@/lib/studio/events";
import { studioText } from "@/lib/studio/copy";
import type { StudioDocument } from "@/lib/studio/document";
export function PublicStudioPage({
  document,
  businessId,
  ownerId,
  language,
  locationLabel,
}: {
  document: StudioDocument;
  businessId: string;
  ownerId?: string;
  language: "fr" | "ar";
  locationLabel: string;
}) {
  const { data: session } = useSession();
  useEffect(() => {
    trackEvent("view", businessId);
  }, [businessId]);
  return (
    <>
      {ownerId && session?.user.id === ownerId && (
        <div className="bc-owner-banner">
          <span>{studioText(language, "privatePreview")}</span>
          <Link href={`/dashboard/businesses/${businessId}/studio`}>
            {studioText(language, "openStudio")} ↗
          </Link>
        </div>
      )}
      <StudioCanvas
        document={document}
        businessId={businessId}
        language={language}
        locationLabel={locationLabel}
      />
    </>
  );
}
