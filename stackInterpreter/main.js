const fs = require("fs");
let {
  instDic,
  stack,
  dirs,
  ids,
  saveTag,
  tags,
  push,
  instArr,
} = require("./stack");
const readline = require("readline");

const execProgram = (idx) => {
  instArr.slice(idx).some((inst) => {
    const fp = inst();
    if (fp !== undefined) {
      execProgram(fp);
      return true;
    }
  });
};

async function processLineByLine(file) {
  try {
    const fileStream = fs.createReadStream(file);
    fileStream.on("error", (e) => console.log("Can't find file " + file));

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let idx = 0;
    for await (const line of rl) {
      if (!line) {
        continue;
      }
      let tagDetect = null;
      const l = line.split(" ");
      if (l[0].endsWith(":")) {
        saveTag(l[0].slice(0, l[0].length - 1), idx);
        tagDetect = l[0].slice(0, l[0].length - 1);
      }
      const inst = tagDetect ? instDic[l[1]] : instDic[l[0]];
      if (!inst) {
        console.log(
          `Error: Instrucción '${tagDetect ? l[1] : l[0]}' no válida`
        );
        process.exit(1);
      }
      if (inst.arg) {
        const arg = tagDetect ? l[2] : l[1];
        if (!arg) {
          console.log(
            `Error: Para la instrucción '${
              tagDetect ? l[1] : l[0]
            }', se espera recibir 1 argumento`
          );
          process.exit(1);
        }
        instArr.push(() => inst.method(arg));
      } else {
        instArr.push(() => inst.method());
      }
      idx++;
    }
    execProgram(0);
    console.log(dirs);
    console.log(ids);
    console.log(tags);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  console.log("Usage: node " + process.argv[1] + " FILENAME");
  process.exit(1);
}
processLineByLine(process.argv[2]);
