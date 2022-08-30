import { dir2array } from "https://js.sabae.cc/dir2array.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { JAPAN_PREF } from "https://js.sabae.cc/JAPAN_PREF.js";

const path = "../j-net21_covid19/";
const fns = await dir2array(path);
const list = [];
for (const fn of fns) {
  const pref = JAPAN_PREF[parseInt(fn.substring(0, 2)) - 1];
  const lgcode = fn.substring(3, 3 + 6);
  //console.log(fn, pref, lgcode)
  const data = CSV.toJSON(await CSV.fetch(path + fn));
  data.forEach(d => {
    list.push({
      date: d.date,
      lgcode,
      pref,
      area: d.area == pref ? "" : d.area,
      title: d.title,
      comment: d.comment,
      url: d.url,
    })
  });
}
list.sort((a, b) => a.date.localeCompare(b.date));

await Deno.writeTextFile("../j-net21_covid19.csv", CSV.stringify(list));
