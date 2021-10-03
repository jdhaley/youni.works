import reg from "./registers.mjs";
import instrs from "./instructions.mjs";

const type = Object.create(null);
type.instructions = instrs;
type.reg = reg;
type.assemble = assemble;
export default type;

function create(assembly) {
	let seg = Object.create(null);
	seg.name = "";
	seg.assembly = assembly;
	seg.type = type;
	seg.stmts = [];
	seg.errors = [];
	seg.labels = Object.create(null);
	seg.reg = type.reg;
	seg.counter = 0;

	let token = assembly.tokens.peek();
	if (token.type == "SYMBOL" && assembly.types[token.value]) {
		//Do a sanity check that this type matches the source's declared type.
		if (assembly.types[token.value] != type) throw new Error();
		assembly.tokens.read();
		if (assembly.tokens.peek().type == "LABEL") {
			seg.name = assembly.tokens.read().value;
		}
	}
	assembly.segments.push(seg);
	return seg;
}

function assemble(assembly) {
	let seg = create(assembly);
	parse(seg);
	seg.code = "";
	for (let instr of seg.stmts) {
		seg.type.instructions[instr.name].asm(instr);
		seg.code += instr.code || "";
	}	
}

function parse(seg) {
	let tokens = seg.assembly.tokens;
	for (let token = tokens.read(); token; token = tokens.read()) {
		//1. check label. It is optional.
		if (token.type == "LABEL") {
			token.pc = seg.counter;
			if (seg.labels[token.value]) {
				console.info("Label is already defined:", token);
			}
			token.name = token.value;
			delete token.value;
			seg.labels[token.name] = token;
			token = tokens.read();
		}

		//2. read the arguments / rest of the line.  This recovers parsing when there is an unknown instruction.
		token.args = [];
		for (let arg = tokens.read(); arg.type != "BR"; arg = tokens.read()) {
			token.args.push(arg);
		}
		
		//3. check for an instruction. It is mandatory.
		let instr = token.type == "SYMBOL" && seg.type.instructions[token.value];
		if (instr) {
			if (instr.type == "directive") {

			} else {
				token.name = token.value;
				token.value = instr.opcode;
				token.pc = seg.counter;
				token.seg = seg;
				//4. Ensure the pc is accurate based on the arguments to the instruction.
				seg.counter += instr.count(token)
				seg.stmts.push(token);	
			}
		} else {
			token.type = "BAD_INSTRUCTION";
			console.info("Invalid instruction:", token);
			seg.errors.push(token);
		}
	}
}
