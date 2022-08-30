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
import { fix0 } from "https://js.sabae.cc/fix0.js";

const fetchJNet = async (npref) => {
  const url = `https://j-net21.smrj.go.jp/snavi/api/internal/v1/articles/specials.json?prefecture=${fix0(npref, 2)}&specialkind=1`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  return await res.json();
};

const scrapeCovid19Support = async (pref, bodyfetch) => {
  const npref = JAPAN_PREF.indexOf(pref) + 1;
  const prefen = JAPAN_PREF_EN[npref - 1];
  console.log(npref, prefen);
  if (!prefen) {
    throw new Error("都道府県不正!" + pref);
  }
  //const url = "https://j-net21.smrj.go.jp/support/covid-19/regional/" + prefen.toLowerCase() + ".html";

  const areas = (await fetchJNet(npref)).areas;
  
  if (bodyfetch) {
    const size = 1024;
    for (const area of areas) {
      const forcefetch = false;
      //const forcefetch = true;
      for (const d of area.articles) {
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
  }

  for (const area of areas) {
    //const n = area.id.indexOf("_");
    //const lgcode = n < 0 ? area.id : area.id.substring(n + 1);
    //console.log(lgcode);

    let lgcode = null;
    if (area.name == pref) {
      lgcode = LGCode.encode(area.name);
    } else {
      lgcode = LGCode.encode(pref + area.name);
    }
    if (!lgcode || lgcode.length == 0) {
      //throw new Error("can't encode LGCode:" + area.name);
      // 区域外データが混ざってる？
      continue;
    }
    console.log(lgcode);
    if (Array.isArray(lgcode)) {
      lgcode = lgcode[0]; // todo! 同名市区町村、違っているかも
      console.log(lgcode);
    }
    const pcode = lgcode.substring(0, 2);

    // area,url,category,title,date
    const path = "../j-net21_covid19/" + pcode;
    const mfn = path + "/" + lgcode + ".csv";
    await Deno.mkdir(path, { recursive: true });
    const list = area.articles.map(d => {
      return {
        id: d.id,
        area: area.name,
        url: d.url,
        category: "",
        title: d.title,
        comment: d.comment,
        body: d.body,
        date: d.publish_start_date,
      };
    });
    await mergeCSV(mfn, list, "url");
  }
};

for (const pref of JAPAN_PREF) {
  try {
    //await scrapeCovid19Support(pref, pref == "福井県" || pref == "大阪府");
    await scrapeCovid19Support(pref, false);
  } catch (e) {
    console.log("**" + e);
  }
}
//await scrapeCovid19Support("大阪府", false);
