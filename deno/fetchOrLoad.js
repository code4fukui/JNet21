import { fetchBin } from "https://js.sabae.cc/fetchBin.js";
import { SJIS } from "https://js.sabae.cc/SJIS.js";

const escapeURL = (url) => {
  let s = url.replace(/\//g, "_");
  s = s.replace(/\?/g, "_");
  s = s.replace(/\s/g, "_");
  return s;
};
const fetchText = async (url) => {
  const bin = await fetchBin(url);
  const text = SJIS.decodeAuto(bin);
  return text;
};
export const fetchOrLoad = async (url, forcefetch) => {
  const fn = "temp/" + escapeURL(url);
  if (!forcefetch) {
    try {
      return await Deno.readTextFile(fn);
    } catch (e) {
    }
  }
  try {
    const html = await fetchText(url);
    await Deno.writeTextFile(fn, html);
    return html;
  } catch (e) {
    console.log("fetch err", e);
    return "";
  }
};
