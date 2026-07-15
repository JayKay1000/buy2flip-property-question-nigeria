let logoCache = null;

const LOGO_URL =
  "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/3aafb3510_Property_Question_logo-1-removebg-preview.png";

export async function getLogoDataUrl() {
  if (logoCache) return logoCache;
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) throw new Error("logo fetch failed");
    const blob = await res.blob();
    logoCache = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return logoCache;
  } catch {
    return null;
  }
}

export async function addLogo(doc, opts = {}) {
  const data = await getLogoDataUrl();
  if (!data) return;
  const pageW = doc.internal.pageSize.getWidth();
  const width = opts.w ?? 28;
  const height = opts.h ?? 11;
  let x;
  if (opts.align === "center") x = (pageW - width) / 2;
  else x = opts.x ?? 14;
  const y = opts.y ?? 14;
  try {
    doc.addImage(data, "PNG", x, y, width, height, undefined, "FAST");
  } catch {
    /* logo unavailable — skip */
  }
}