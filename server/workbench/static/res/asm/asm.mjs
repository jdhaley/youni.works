import lex from "./lexer.mjs";
import ops from "./ops.mjs";
import reg from "./registers.mjs";
import assembler from "./assembler.mjs";

const asm = Object.create(assembler);
asm.lex = lex;
asm.ops = ops;
asm.reg = reg;
Object.freeze(asm);

export default asm;
