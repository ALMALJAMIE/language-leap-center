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
