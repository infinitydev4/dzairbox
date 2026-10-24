import { z } from "zod";
import { businessCategories } from "@/lib/constants";
import { locationSchema, normalizePhone } from "@/lib/studio/document";
export const accountSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  email: z
    .email("email")
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8, "password").max(128, "password"),
});
export const activitySchema = z.object({
  name: z.string().trim().min(2, "businessName").max(100),
  category: z.enum(businessCategories, { error: "category" }),
});
export const contactSchema = z
  .object({
    phone: z
      .string()
      .transform(normalizePhone)
      .pipe(z.string().regex(/^\+213[1-9]\d{8}$/, "phone")),
    location: locationSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.location.wilayaCode || !data.location.communeCode)
      ctx.addIssue({ code: "custom", path: ["location"], message: "location" });
    if (
      data.location.mode === "establishment" &&
      data.location.address.trim().length < 5
    )
      ctx.addIssue({ code: "custom", path: ["location"], message: "address" });
    if (data.location.mode === "area" && data.location.address)
      ctx.addIssue({ code: "custom", path: ["location"], message: "location" });
  });
export const onboardingSchema = z.object({
  requestId: z.uuid(),
  language: z.enum(["fr", "ar"]).default("fr"),
  account: accountSchema.optional(),
  business: activitySchema,
  contact: contactSchema,
});
export type OnboardingDraft = {
  requestId: string;
  account: { name: string; email: string; password: string };
  business: { name: string; category: string };
  contact: { phone: string; location: z.infer<typeof locationSchema> };
};
export const draftSchema = z.object({
  requestId: z.uuid(),
  account: z.object({ name: z.string(), email: z.string() }),
  business: z.object({ name: z.string(), category: z.string() }),
  contact: z.object({ phone: z.string(), location: locationSchema }),
});
export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    requestId: "",
    account: { name: "", email: "", password: "" },
    business: { name: "", category: "" },
    contact: {
      phone: "",
      location: {
        mode: "establishment",
        wilayaCode: "",
        communeCode: "",
        address: "",
        areas: [],
        point: null,
      },
    },
  };
}
export { normalizePhone as normalizeAlgerianPhone };
const reserved = new Set([
  "admin",
  "dashboard",
  "auth",
  "api",
  "businesses",
  "business",
  "services",
  "create-service",
  "onboarding",
  "register",
  "about",
  "contact",
  "privacy",
  "terms",
  "studio",
  "manifest",
  "sitemap",
  "robots",
]);
export function businessSlug(name: string) {
  const value = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/, "");
  return !value || reserved.has(value) ? "business" : value;
}
