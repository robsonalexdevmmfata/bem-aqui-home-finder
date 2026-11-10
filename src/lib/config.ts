/**
 * Integration configuration. Values come from public VITE_* env vars so real
 * credentials can be plugged in later — nothing here is faked as "active".
 */
const env = import.meta.env as Record<string, string | undefined>;

export const integrations = {
  /** Platform WhatsApp number in international format, e.g. 5511999999999. */
  whatsappNumber: env["VITE_WHATSAPP_NUMBER"] ?? "",
  /** Google Analytics 4 measurement ID (G-XXXXXXX). */
  gaMeasurementId: env["VITE_GA_MEASUREMENT_ID"] ?? "",
  /** Google Maps Embed API key (browser key restricted by domain). */
  googleMapsKey: env["VITE_GOOGLE_MAPS_EMBED_KEY"] ?? "",
};

export const SITE = {
  name: "BEM AQUI IMÓVEIS",
  slogan: "Conectando pessoas, imóveis e oportunidades.",
  hero: "Seu próximo endereço começa aqui.",
};

export function whatsappLink(number: string | null | undefined, text: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
