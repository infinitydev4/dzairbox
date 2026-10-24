"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, LogOut, Plus, Store, UserRound } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import "../studio.css";
import "../directory.css";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const path = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const restricted =
    !!session &&
    !session.user.emailVerified &&
    !path.endsWith("/studio") &&
    path !== "/dashboard/businesses" &&
    path !== "/dashboard" &&
    path !== "/dashboard/create-business";
  useEffect(() => {
    if (status === "unauthenticated")
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
    else if (restricted) router.replace("/dashboard/businesses");
  }, [status, router, path, restricted]);
  if (!session || restricted)
    return (
      <div className="st-loading">
        <Loader2 className="ob-spin" />
      </div>
    );
  if (path.endsWith("/studio")) return children;
  return (
    <div className="dashboard-v1" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="local-header">
        <Link className="st-brand" href="/">
          Dzair<span>Box</span>
        </Link>
        <nav>
          <Link href="/dashboard/businesses">
            <Store size={14} />
            {t("studio.myActivities")}
          </Link>
          <Link href="/onboarding">
            <Plus size={14} />
            {t("studio.create")}
          </Link>
          {session.user.emailVerified && (
            <Link href="/dashboard/profile">
              <UserRound size={14} />
              {session.user.name}
            </Link>
          )}
          {session.user.role === "ADMIN" && session.user.emailVerified && (
            <Link href="/admin/businesses">{t("studio.moderation")}</Link>
          )}
        </nav>
        <div className="local-header-actions">
          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "fr" : "ar")}
          >
            {language === "ar" ? "FR" : "ع"}
          </button>
          <button
            type="button"
            aria-label={t("studio.logout")}
            onClick={() => void signOut({ callbackUrl: "/" })}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <main className="dashboard-v1-main">{children}</main>
    </div>
  );
}
