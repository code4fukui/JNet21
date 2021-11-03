const url = "https://j-net21.smrj.go.jp/support/list.html";
const txt = await (await fetch(url)).text();
await Deno.writeTextFile("temp/list.html", txt);
