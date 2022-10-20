import { HTMLParser } from "https://js.sabae.cc/HTMLParser.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { Day } from "https://js.sabae.cc/DateTime.js";
import { fetchOrLoad } from "./fetchOrLoad.js";
import { mergeCSV } from "./mergeCSV.js";
import { fix0 } from "https://js.sabae.cc/fix0.js";

const listfetch = true;

const url = "https://j-net21.smrj.go.jp/support/list.html";
const html = await fetchOrLoad(url, listfetch);
//const html = await Deno.readTextFile("temp/list.html");
const dom = HTMLParser.parse(html);
const lls = dom.querySelectorAll("li.columnItem");
const data = lls.map(ll => {
  const s = ll.querySelector("h3").text.trim();
  const n = s.lastIndexOf("：");
  const title = n >= 0 ? s.substring(0, n) : s;
  const subtitle = n >= 0 ? s.substring(n + 1) : "";
  return {
    url: "https://j-net21.smrj.go.jp" + ll.querySelector("a").attributes.href,
    title,
    subtitle,
    category: ll.querySelector(".cate")?.text.trim(),
  };
});
console.log(data);

for (const d of data) {
  try {
    const html = await fetchOrLoad(d.url);
    const dom = HTMLParser.parse(html);
    const a = dom.querySelector("article");
    d.tags = a.querySelectorAll(".h1-labels li").map(li => li.text.trim()).join(",");
    //d.longtitle = a.querySelector("h1")?.text; // same
    d.date = a.querySelector("p.txt-right")?.text.trim();
    if (d.date) {
      try {
        d.date = new Day(d.date).toString();
      } catch (e) {
        const ym = d.date.match(/(\d+)年(\d+)月/);
        if (ym) {
          const s = ym[1] + "-" + fix0(ym[2], 2) + "-01";
          //console.log(ym, s);
          d.date = new Day(s).toString();
        } else {
          console.log("invalid", d.date);
          //Deno.exit(0);
          d.date = new Day().toString();
        }
      }
    } else {
      d.date = new Day().toString();
    }
    d.body = a.text.replace(/\s/g, ""); // for search
    //console.log(d.url, d.date, d.tags);
  } catch (e) {
    console.log(e);
  }
}
data.sort((a, b) => a.date?.localeCompare(b?.date));
//await Deno.writeTextFile("data.csv", CSV.stringify(data));

const mfn = "../j-net21_support-list.csv";
await mergeCSV(mfn, data, "url");
