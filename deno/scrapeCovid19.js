import { HTMLParser } from "https://js.sabae.cc/HTMLParser.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { Day } from "https://js.sabae.cc/DateTime.js";
import { fetchOrLoad } from "./fetchOrLoad.js";
import { mergeCSV } from "./mergeCSV.js";
import { flatten } from "./flatten.js";
import { LGCode } from "https://code4fukui.github.io/LGCode/LGCode.js";
import { ArrayUtil } from "https://js.sabae.cc/ArrayUtil.js";
import { JAPAN_PREF, JAPAN_PREF_EN } from "https://js.sabae.cc/JAPAN_PREF.js";
//import { fetchCurl } from "https://js.sabae.cc/fetchCurl.js";

const scrapeCovid19Support = async (pref, bodyfetch) => {
  const prefen = JAPAN_PREF_EN[JAPAN_PREF.indexOf(pref)];
  if (!prefen) {
    throw new Error("都道府県不正!" + pref);
  }
  const url = "https://j-net21.smrj.go.jp/support/covid-19/regional/" + prefen.toLowerCase() + ".html";

  const listfetch = true;
  const html = await fetchOrLoad(url, listfetch);
  const dom = HTMLParser.parse(html);
  const main = dom.querySelector("main");
  const data = {};
  data.info = main?.querySelector("p.h1-subTitle")?.text;
  if (!data.info) {
    throw new Error("not found title " + pref);
  }
  data.type = main.querySelector("h1").text;
  data.sections = main.querySelectorAll("section").map(section => {
    const d = {};
    d.area = section.querySelector("h2")?.text || section.querySelector("h3")?.text;
    d.items = section.querySelectorAll("ul li").map(li => {
      const a = li.querySelector("a");
      if (!a) {
        return null;
      }
      const n = a.text.indexOf("：");
      const title = n >= 0 ? a.text.substring(n + 1) : a.text;
      const category = n >= 0 ? a.text.substring(0, n) : "";
      const date = new Day().toString();
      return {
        url: a.attributes.href,
        category,
        title,
        date,
      };
    });
    return d;
  });
  console.log(data);

  const size = 1024 * 1; // 1024 * 10

  const list = flatten(data).filter(l => l && l.area != "関連リンク");

  if (bodyfetch) {
    let forcefetch = false;
    //forcefetch = true;
    for (const d of list) {
      console.log(d.url);
      const html = await fetchOrLoad(d.url, forcefetch);
      const dom = HTMLParser.parse(html);
      const body = dom.querySelector("body")?.text;
      //d.body = a.text.replace(/\s/g, ""); // for search
      d.body = body?.substring(0, size).replace(/\s/g, "");
      //console.log(d.url, d.date, d.tags);
      console.log(d.body?.substring(0, 100));
    }
    //data.sort((a, b) => a.date?.localeCompare(b?.date));
  }

  const remap = {
    "大阪府四条畷市": "四條畷市",
    "宮城県塩竃市": "塩竈市",
    "福島県国見市": "国見町",
    "福島県飯館村": "飯舘村",
    "三重県渡会町": "度会町",
    "和歌山県上冨田町": "上富田町",
    "徳島県上坂町": "上板町",
    "福岡県糟屋町": "粕屋町",
  };
  list.forEach(l => {
    const re = remap[pref + l.area];
    if (re) {
      l.area = re;
    }
    delete l.info;
    delete l.type;
  });

  //await Deno.writeTextFile("data-osaka.csv", CSV.stringify(list));
  //console.log(list.length);

  //const mfn = "../j-net21_covid19-osaka-all.csv";
  //await mergeCSV(mfn, list, "url");

  const areas = ArrayUtil.toUnique(list.map(d => d.area));
  for (let area of areas) {
    let lgcode = null;
    //
    if (area == "西興部町") {
      area = "西興部村";
    }
    //
    if (area == pref) {
      lgcode = LGCode.encode(area);
    } else {
      lgcode = LGCode.encode(pref + area);
    }
    if (!lgcode) {
      throw new Error("can't encode LGCode:" + area);
    }
    console.log(lgcode);
    if (Array.isArray(lgcode)) {
      lgcode = lgcode[0]; // todo! 同名市区町村、違っているかも
    }
    const pcode = lgcode.substring(0, 2);

    const path = "../j-net21_covid19/" + pcode;
    const mfn = path + "/" + lgcode + ".csv";
    await Deno.mkdir(path, { recursive: true });
    await mergeCSV(mfn, list.filter(d => d.area == area), "url");
  }
};

for (const pref of JAPAN_PREF) {
  try {
    await scrapeCovid19Support(pref, pref == "福井県" || pref == "大阪府");
  } catch (e) {
    console.log("**" + e);
  }
}
//await scrapeCovid19Support("福井県");
