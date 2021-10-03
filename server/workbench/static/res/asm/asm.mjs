import lex from "./lexer.mjs";
import reg from "./registers.mjs";
import instrs from "./instructions.mjs";
import assembler from "./assembler.mjs";

const asm = Object.create(assembler);
asm.lex = lex;
asm.instructions = instrs;
asm.reg = reg;
Object.freeze(asm);

export default asm;
