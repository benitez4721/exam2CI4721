const { expect } = require("@jest/globals");
const { processEntry, execProgram } = require("./main");
let { instDic, stack } = require("./stack");

const test1 = ["PUSH 20", "PUSH 10", "ADD"];

const test2 = [
  "PUSH 0",
  "LVALUE s",
  "ASSIGN",
  "PUSH 0",
  "LVALUE i",
  "ASSIGN",
  "condition: RVALUE i",
  "PUSH 10",
  "LT",
  "GOTRUE do",
  "GOFALSE end",
  "do: RVALUE s",
  "RVALUE i",
  "RVALUE i",
  "MUL",
  "PUSH 2",
  "DIV",
  "ADD",
  "LVALUE s",
  "ASSIGN",
  "RVALUE i",
  "PUSH 1",
  "ADD",
  "LVALUE i",
  "ASSIGN",
  "GOTO condition",
  "end:",
];

const test3 = ["RESET", "PUSH 6", "PUSH 5", "GT"];
const test4 = ["RESET", "PUSH 6", "PUSH 6", "GE"];

test("complete", () => {
  test2.forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  execProgram(0);
  expect(stack).toStrictEqual([]);
});

test("GT", () => {
  test3.forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  execProgram(0);
  expect(stack).toStrictEqual([true]);
});

test("GE", () => {
  test4.forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  execProgram(0);
  expect(stack).toStrictEqual([true]);
});

test("empty stack", () => {
  ["ADD"].forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  expect(execProgram(0)).toBe(undefined);
});

test("Lvalue error", () => {
  ["PUSH 7", "PUSH 8", "ASSIGN", "MUL", "DIV"].forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  expect(execProgram(0)).toBe(undefined);
});

test("Rvalue error", () => {
  ["RVALUE i"].forEach((inst, idx) => {
    processEntry(inst, idx);
  });
  expect(execProgram(0)).toBe(undefined);
});
