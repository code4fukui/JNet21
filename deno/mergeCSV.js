import { CSV } from "https://js.sabae.cc/CSV.js";

const loadCSV = async (fn) => {
  try {
    return CSV.toJSON(await CSV.fetch(mfn));
  } catch (e) {
  }
  return [];
};

export const mergeCSV = async (fn, data, key) => {
  const mdata = await loadCSV(fn);
  data.forEach(d => {
    if (mdata.find(m => m[key] == d[key])) {
      return;
    }
    mdata.push(d);
    console.log("add", d.url, d.title);
  });
  await Deno.writeTextFile(fn, CSV.stringify(mdata));
};
