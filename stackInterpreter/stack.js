const prompt = require("prompt-sync")();
const { v4: uuidv4, validate: validateDir } = require("uuid");
const instArr = [];
let stack = [];
const isBoolean = (val) => val === "true" || val === "false";
const isInt = (val) => Number.isInteger(Number(val));
let fp = 0;
let tags = {};
let ids = {};
let dirs = {};
const instDic = {
  EXIT: {
    arg: false,
    method: (val) => exit(val, false),
  },
  RESET: {
    arg: false,
    method: (val) => reset(val, false),
  },
  GOFALSE: {
    arg: true,
    method: (val) => conditional(val, false),
  },
  GOTRUE: {
    arg: true,
    method: (val) => conditional(val, true),
  },
  GOTO: {
    arg: true,
    method: (val) => goto(val),
  },
  PRINT: {
    arg: true,
    method: (val) => print(val),
  },
  PUSH: {
    arg: true,
    method: (val) => push(val),
  },
  POP: {
    arg: false,
    method: () => stack.pop(),
  },
  ADD: {
    arg: false,
    method: () => add(),
  },
  SUB: {
    arg: false,
    method: () => sub(),
  },
  MUL: {
    arg: false,
    method: () => mult(),
  },
  DIV: {
    arg: false,
    method: () => div(),
  },
  AND: {
    arg: false,
    method: () => and(),
  },
  OR: {
    arg: false,
    method: () => or(),
  },
  LT: {
    arg: false,
    method: () => lt(),
  },
  LQ: {
    arg: false,
    method: () => lq(),
  },
  LE: {
    arg: false,
    method: () => le(),
  },
  GT: {
    arg: false,
    method: () => gt(),
  },
  GE: {
    arg: false,
    method: () => ge(),
  },
  EQ: {
    arg: false,
    method: () => comp("EQ"),
  },
  NEQ: {
    arg: false,
    method: () => comp("NEQ"),
  },
  UMINUS: {
    arg: false,
    method: () => unary("UMINUS"),
  },
  NOT: {
    arg: false,
    method: () => unary("NOT"),
  },
  RVALUE: {
    arg: true,
    method: (id) => pushId(id),
  },
  LVALUE: {
    arg: true,
    method: (id) => pushDir(id),
  },
  READ: {
    arg: true,
    method: (id) => read(id),
  },
  ASSIGN: {
    arg: false,
    method: (id) => asign(),
  },
};

const getValue = (id) => {
  return dirs[ids[id]];
};

const popStack = (inst) => {
  if (!stack.length) {
    console.log(
      `Instruction '${inst}' cannot be executed, because the stack is empty.`
    );
    return null;
  }
  return stack.pop();
};

const popStack2 = (inst) => {
  if (stack.length < 2) {
    console.log(
      `Error: instruction '${inst}' cannot be executed for missing arguments.`
    );
    return null;
  }

  return stack.splice(-2, 2);
};

const typeError = (inst, type) => {
  console.log(
    `Error: arguments for instruction '${inst}', have to be of type '${type}'`
  );
};

const checkPushValue = (value) => {
  if (!(isBoolean(value) || isInt(value))) {
    console.log(
      `Value '${value}' has to be an Integer or Boolean (true, false).`
    );
    return false;
  }
  return true;
};

const push = (value) => {
  if (!checkPushValue(value)) return;
  if (isBoolean(value)) {
    stack.push(value === "true");
  } else {
    stack.push(Number(value));
  }
};

const add = () => {
  const nums = popStack2("ADD");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("ADD", "Int");
    return;
  }
  stack.push(nums[0] + nums[1]);
};

const sub = () => {
  const nums = popStack2("SUB");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("SUB", "Int");
    return;
  }
  stack.push(nums[0] - nums[1]);
};

const mult = () => {
  const nums = popStack2("MULT");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("MULT", "Int");
    return;
  }
  stack.push(nums[0] * nums[1]);
};

const div = () => {
  const nums = popStack2("DIV");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("DIV", "Int");
    return;
  }
  if (nums[1] == 0) {
    console.log("Error: cannot divide by 0.");
    process.exit(1);
  }
  stack.push(parseInt(nums[0] / nums[1]));
};

const and = () => {
  const nums = popStack2("AND");
  if (!nums) return;
  if (nums.some((val) => !(typeof val == "boolean"))) {
    typeError("AND", "Bool");
    return;
  }
  stack.push(nums[0] && nums[1]);
};

const or = () => {
  const nums = popStack2("OR");
  if (!nums) return;
  if (nums.some((val) => !(typeof val == "boolean"))) {
    typeError("OR", "Bool");
    return;
  }
  stack.push(nums[0] || nums[1]);
};

const lt = () => {
  const nums = popStack2("LT");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("LT", "Int");
    return;
  }
  stack.push(nums[0] < nums[1]);
};

const le = () => {
  const nums = popStack2("LE");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("LE", "Int");
    return;
  }
  stack.push(nums[0] <= nums[1]);
};
const gt = () => {
  const nums = popStack2("GT");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("GT", "Int");
    return;
  }
  stack.push(nums[0] > nums[1]);
};
const ge = () => {
  const nums = popStack2("GE");
  if (!nums) return;
  if (nums.some((val) => !Number.isInteger(val))) {
    typeError("GE", "Int");
    return;
  }
  stack.push(nums[0] >= nums[1]);
};

const comp = (inst) => {
  const nums = popStack2("GE");
  if (!nums) return;
  if (
    !(
      (typeof nums[0] == "boolean" && typeof nums[1] == "boolean") ||
      (Number.isInteger(nums[0]) && Number.isInteger(nums[0]))
    )
  ) {
    console.log(
      `Error: arguments have to be the same type, for instruction '${inst}'.`
    );
    return;
  }
  if (inst === "EQ") {
    stack.push(nums[0] == nums[1]);
  } else {
    stack.push(nums[0] != nums[1]);
  }
};

const unary = (inst) => {
  const num = popStack();
  if (inst == "UMINUS") {
    if (!Number.isInteger(num)) {
      typeError(inst, "Int");
      return;
    }
    stack.push(num * -1);
  } else {
    if (typeof num != "boolean") {
      typeError(inst, "Bool");
      return;
    }
    stack.push(!num);
  }
};

const lookup = (id) => {
  if (!ids[id] || (!getValue(id) && getValue(id) !== 0)) {
    console.log(`Error: '${id}' is undefined.`);
    return false;
  }
  return true;
};

const pushId = (id) => {
  if (lookup(id)) {
    stack.push(getValue(id));
  }
};

const pushDir = (id) => {
  if (ids[id]) {
    stack.push(ids[id]);
  } else {
    const dir = uuidv4();
    ids[id] = dir;
    dirs[dir] = undefined;
    stack.push(dir);
  }
};

const read = (id) => {
  const value = prompt(`Ingrese un valor para la variable '${id}': `);
  if (!checkPushValue(value)) return;
  const dir = uuidv4();
  if (isBoolean(value)) {
    ids[id] = dir;
    dirs[dir] = value === "true";
  } else {
    ids[id] = dir;
    dirs[dir] = Number(value);
  }
};

const asign = () => {
  const nums = popStack2("GE");
  if (!nums) return;
  if (!validateDir(nums[1])) {
    console.log(`Error: ${nums[1]} is not a valid address direction.`);
    return;
  }
  dirs[nums[1]] = nums[0];
};

const print = (id) => {
  if (lookup(id)) {
    console.log(getValue(id));
  }
};

const saveTag = (tag, inst) => {
  tags[tag] = inst;
};

const tagError = (tag) => {
  if (!tags[tag]) {
    console.log(`Error: tag '${tag}' does not exist.`);
    return true;
  }
  return false;
};

const execTag = (tag) => {
  const l = tags[tag].split(" ");
  const inst = instDic[l[0]];
  if (inst.arg) {
    if (!l[1]) {
      console.log(
        `Error: Para la instrucción '${l[0]}', se espera recibir 1 argumento`
      );
      return;
    }
    inst.method(l[1]);
  } else {
    inst.method();
  }
};

const goto = (tag) => {
  if (tagError(tag)) {
    return;
  }
  fp = tags[tag];
  return fp;
};

const conditional = (tag, condition) => {
  if (tagError(tag)) {
    return;
  }
  let val;
  if (condition) {
    val = popStack("GOTRUE");
  } else {
    val = popStack("GOFALSE");
  }
  if (val === null) return;
  if (typeof val == "boolean") {
    if (condition) {
      if (val) {
        fp = tags[tag];
        return fp;
      } else {
        stack.push(val);
      }
    } else {
      if (!val) {
        fp = tags[tag];
        return fp;
      } else {
        stack.push(val);
      }
    }
  } else {
    stack.push(val);
  }
};

const reset = () => {
  stack = [];
  tags = [];
  dirs = [];
  ids = [];
};

const exit = () => {
  process.exit(1);
};

module.exports = {
  push,
  instDic,
  stack,
  dirs,
  ids,
  saveTag,
  tags,
  instArr,
  fp,
};
