"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/language-provider";
import { BrandLogo } from "@/components/brand-logo";
export function LocalHeader() {
  const { t, language, setLanguage } = useLanguage();
  const { data: session } = useSession();
  return (
    <header className="local-header">
      <Link className="st-brand" href="/" aria-label="DzairBox">
        <BrandLogo priority alt="" />
      </Link>
      <nav>
        <Link href="/businesses">{t("studio.directory")}</Link>
        <Link href={session ? "/dashboard/businesses" : "/auth/signin"}>
          {t(session ? "studio.myActivities" : "onboarding.signIn")}
        </Link>
      </nav>
      <div className="local-header-actions">
        <div className="dz-language">
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            aria-pressed={language === "fr"}
          >
            FR
          </button>
          <span />
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            aria-pressed={language === "ar"}
          >
            ع
          </button>
        </div>
        <Link className="local-create" href="/onboarding">
          {t("studio.create")} ↗
        </Link>
      </div>
    </header>
  );
}
