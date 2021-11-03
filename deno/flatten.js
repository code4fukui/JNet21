
const flatten1 = (data) => {
  let ar = null;
  let arname = null;
  const base = {};
  for (const name in data) {
    if (Array.isArray(data[name])) {
      if (ar) {
        throw new Error("array must be only 1 entry");
      }
      arname = name;
      ar = data[name];
      base[name] = null;
    } else {
      base[name] = data[name];
    }
  }
  if (!ar) {
    return null;
  }
  return ar.map(a => {
    const d = {};
    for (const bname in base) {
      if (bname == arname) {
        if (typeof a == "object") {
          for (const name in a) {
            d[name] = a[name];
          }
        } else {
          d[bname] = a;
        }
      } else {
        d[bname] = base[bname];
      }
    }
    return d;
  });
};
export const flatten = (data) => {
  const d2 = flatten1(data);
  if (!d2) {
    return [data];
  }
  const res = [];
  d2.forEach(d => {
    const d2 = flatten(d);
    d2.forEach(d => res.push(d));
  });
  return res;
};
