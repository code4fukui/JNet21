import * as t from "https://deno.land/std/testing/asserts.ts";
import { flatten } from "./flatten.js";

Deno.test("simple", () => {
  const d = {
    a: "a1",
    b: [ 1, 2, 3 ],
  };
  const e = [
    { a: "a1", b: 1 },
    { a: "a1", b: 2 },
    { a: "a1", b: 3 },
  ];
  t.assertEquals(flatten(d), e);
});
Deno.test("can't", () => {
  const d = {
    a: "a1",
    b: [ 1, 2, 3 ],
    c: [ 1, 2, 3 ],
  };
  t.assertThrows(() => flatten(d));
});
Deno.test("object", () => {
  const d = {
    a: "a1",
    b: [
      { c: 1 },
      { c: 2 },
      { c: 3 },
    ],
  };
  const e = [
    { a: "a1", c: 1 },
    { a: "a1", c: 2 },
    { a: "a1", c: 3 },
  ];
  t.assertEquals(flatten(d), e);
});

Deno.test("tree", () => {
  const d = {
    a: "a1",
    b: [
      { x: 3, y: [ 31, 32 ] },
      { x: 4, y: [ 41, 42 ] },
    ],
  };
  const e = [
    { a: "a1", x: 3, y: 31 },
    { a: "a1", x: 3, y: 32 },
    { a: "a1", x: 4, y: 41 },
    { a: "a1", x: 4, y: 42 },
  ];
  t.assertEquals(flatten(d), e);
});

Deno.test("single", () => {
  const d = {
    a: "a1",
  };
  const e = [
    { a: "a1" }
  ];
  t.assertEquals(flatten(d), e);
});
