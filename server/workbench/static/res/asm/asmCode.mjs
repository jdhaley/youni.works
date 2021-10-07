import reg from "./registers.mjs";
import instrs from "./instructions.mjs";

let jsOps = "";
let cOps = "";
for (let name in instrs) {
	let instr = instrs[name];
	jsOps += `const OP_${name.toUpperCase()} = ${instr.opcode};\n`;
	cOps += `\tOP_${name.toUpperCase()} = ${instr.opcode},\n`;
}
console.log(jsOps);
console.log(cOps);


const type = Object.create(null);
type.code = "c";
type.instructions = instrs;
type.reg = reg;
type.assemble = assemble;
export default type;

function create(assembly) {
	let seg = Object.create(null);
	seg.assembly = assembly;
	seg.name = "";
	seg.type = type;
	seg.stmts = [];
	seg.opcodes = [];

	seg.errors = [];
	// seg.labels = Object.create(null);
	seg.reg = type.reg;
	seg.counter = 0;

	let tokens = assembly.tokens;
	let token = tokens.peek();
	if (token.type == "SYMBOL" && assembly.types[token.value]) {
		let line = [];
		for (let arg = tokens.peek(); arg && arg.line == token.line; arg = tokens.peek()) {
			line.push(tokens.read());
		}
		if (line[1] && line[1].type == "SYMBOL") {
			seg.name = line[1].value;
		}
	}
	assembly.segments.push(seg);
	return seg;
}

function assemble(assembly) {
	let seg = create(assembly);
	parse(seg);
	for (let instr of seg.stmts) {
		let op = seg.type.instructions[instr.name];
		op.type.asm(instr, op);
	}
	seg.code = "";
	for (let i = 0; i < seg.opcodes.length; i += 2) {
//		console.log(seg.opcodes[i], seg.opcodes[i + 1]);
		seg.code += seg.assembly.encode(seg.opcodes[i] | (seg.opcodes[i + 1] || 0) << 16);
	}
	//The header is the segment type & target length.
	let count = seg.opcodes.length / 2;
	if (seg.opcodes.length % 2) count++;
	seg.header = "/" + seg.type.code + seg.assembly.encode(count);
}

function parse(seg) {
	let tokens = seg.assembly.tokens;
	for (let token = tokens.peek(); token; token = tokens.peek()) {
		//0. check if the token is a segment directive.
		if (token.type == "SYMBOL" && seg.assembly.types[token.value]) {
			seg.assembly.types[token.value].assemble(seg.assembly);
			return;
		}
		token = tokens.read();

		//1. check label. It is optional.
		if (token.type == "LABEL") {
			token.offset = seg.counter;
			if (seg.assembly.labels[token.value]) {
				console.info("Label is already defined:", token);
			}
			token.name = token.value;
			token.seg = seg;
			delete token.value;
			seg.assembly.labels[token.name] = token;
			token = tokens.read();
		}

		//2. read the arguments / rest of the line.  This recovers parsing when there is an unknown instruction.
		token.args = [];
		for (let arg = tokens.peek(); arg && arg.line == token.line; arg = tokens.peek()) {
			token.args.push(tokens.read());
		}
		
		//3. check for an instruction. It is mandatory.
		let instr = token.type == "SYMBOL" && seg.type.instructions[token.value];
		if (instr) {
			token.name = token.value;
			token.value = instr.opcode;
			token.offset = seg.counter;
			token.seg = seg;
			//4. Ensure the pc is accurate based on the arguments to the instruction.
			seg.counter += instr.type.count(token)
			seg.stmts.push(token);	
		} else {
			token.type = "BAD_INSTRUCTION";
			console.error("Invalid instruction:", token);
			seg.errors.push(token);
		}
	}
}
