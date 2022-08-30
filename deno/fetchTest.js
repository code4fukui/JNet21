const url = "https://j-net21.smrj.go.jp/snavi/api/internal/v1/articles/specials.json?prefecture=27&specialkind=1";

const fetchJNet = async (url) => {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      //Accept: "application/json, text/javascript, */*; q=0.01",
      //Referer: "https://j-net21.smrj.go.jp/support/covid-19/regional/special_articles.html?prefecture=27&specialkind=1",
      //Cookie: "_gcl_au=1.1.50929803.1660721952; _ga=GA1.4.1289699825.1660721953; _ga=GA1.1.1289699825.1660721953; _gid=GA1.4.1537295908.1661814146; _gat_UA-64145487-2=1; _ga_BL29KTEVYF=GS1.1.1661814146.2.1.1661814357.0.0.0",
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  return await res.json();
};
const data = await fetchJNet(url);
console.log(JSON.stringify(data, null, 2));
