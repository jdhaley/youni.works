const asm = Object.create(null);
asm.ops = null;
asm.reg = null;
asm.segment = segment;
asm.lex = lex;
asm.parse = parse;
asm.assemble = assemble;
export default asm;

function assemble(source) {
	let tokens = this.lex(source);
	let segments = this.parse(tokens);
	for (let seg of segments) {
		seg.code = "";
		for (let instr of seg.stmts) {
			this.ops[instr.name].asm(instr);
			seg.code += instr.code || "";
		}	
	}
	console.info(segments);
	let code = "";
	for (let seg of segments) {
		code += seg.code;
	}
	return code;
}
// const seg = {
// 	type: "",
// 	stmts: [],
// 	labels: null,
// }
function segment(type, name) {
	let seg = Object.create(null);
	seg.type = type || "CODE";
	seg.name = name || "";
	seg.assembler = this;
	seg.stmts = [];
	seg.errors = [];
	seg.labels = Object.create(null);
	seg.reg = this.reg;
	seg.counter = 0;
	return seg;
}

function read() {
	return this[this.cursor++];
}
const segmentType = {
	CODE: {
	},
	DATA: {
	}
}
function parse(tokens) {
	tokens.cursor = 0;
	tokens.read = read;

	let segments = [];
	let seg = this.segment();
	segments.push(seg);
	for (let token = tokens.read(); token; token = tokens.read()) {
		//1. check label. It is optional.
		if (token.name == "LABEL") {
			token.pc = seg.counter;
			if (seg.labels[token.value]) {
				console.info("Label is already defined:", token);
			}
			token.name = token.value;
			delete token.value;
			seg.labels[token.name] = token;
			token = tokens.read();
			if (token.name == "BR") {
				//a label can appear on its own line
				token = tokens.read();
			}
		}

		//2. read the arguments / rest of the line.  This recovers parsing when there is an unknown op.
		token.args = [];
		for (let arg = tokens.read(); arg.name != "BR"; arg = tokens.read()) {
			token.args.push(arg);
		}
		
		//3. check for an op. It is mandatory.
		let op = token.name == "SYMBOL" && this.ops[token.value];
		if (op) {
			token.name = token.value;
			token.value = op.opcode;
			token.pc = seg.counter;
			token.seg = seg;
			//4. Ensure the pc is accurate based on the arguments to the instruction.
			seg.counter += op.count(token)
			seg.stmts.push(token);
		} else {
			token.name = "BAD_INSTRUCTION";
			console.info("Invalid instruction:", token);
			seg.errors.push(token);
		}
	}
	return segments;
}

function lex() {
}
