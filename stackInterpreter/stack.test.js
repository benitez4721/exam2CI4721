const { expect } = require("@jest/globals");
const { instDic, stack } = require("./stack");

test("push", () => {
  instDic["PUSH"].method("5");
  expect(stack).toStrictEqual([5]);
});
