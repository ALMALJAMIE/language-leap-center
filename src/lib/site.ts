/** Contact details and social links — edit here to update the whole site */
export const site = {
  phone: "+60 11-1167 8407",
  phoneHref: "tel:+601111678407",
  email: "llcent.mgmt@gmail.com",
  whatsapp: "https://wa.me/601111678407",
  social: {
    instagram: "https://www.instagram.com/languageleapcentre",
    snapchat: "https://www.snapchat.com/add/llc_center",
  },
};

/** Supabase project (the publishable key is designed to be public) */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rjmaeflnyfesgrgkqncd.supabase.co",
  key: process.env.NEXT_PUBLIC_SUPABASE_KEY || "sb_publishable_D_mJ01ZNwgNImO17IgPa1w_Qa5Mus8P",
};

/** Turn these on after enabling each provider in Supabase → Authentication → Providers */
export const oauthEnabled = {
  google: false,
  facebook: false,
};

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Payments
 * - links: paste a payment link per course (Stripe / Xendit / Billplz / ToyyibPay…).
 *   If a course has no link yet, "Complete Enrollment" sends the order to WhatsApp instead.
 * - addOns and coupons are examples: change names, prices and codes freely.
 */
export const payments = {
  currency: "USD",
  accessMonths: 12,
  links: {} as Record<string, string>,
  addOns: [
    { id: "live30", title: "Live Speaking Session (30 min)", desc: "One 1-on-1 video session with a teacher to practise this course's speaking topics.", price: 15 },
    { id: "writing", title: "Teacher-Reviewed Writing Task", desc: "Submit one writing task and get personal written feedback from a teacher.", price: 10 },
  ],
  coupons: {
    WELCOME10: { percent: 10, label: "Welcome discount — 10% off" },
  } as Record<string, { percent: number; label: string }>,
};
