const asm = Object.create(null);
asm.ops = null;
asm.reg = null;
asm.lex = lex;
asm.parse = parse;
asm.assemble = assemble;
export default asm;

function assemble(source) {
	let tokens = this.lex(source);
	let model = this.parse(tokens);
	for (let i = 0; i < model.instrs.length; i++) {
		this.ops[model.instrs[i].name].asm(model, i);
	}
	let code = "";
	for (let instr of model.instrs) {
		if (instr.error) return "";
		if (instr.code) code += instr.code;
	}
	model.code = code;
	console.info(model);
	return model;
}
// const seg = {
// 	type: "",
// 	stmts: [],
// 	labels: null,
// }
function parse(tokens) {
	let model = Object.create(null);
	model.instrs = [];
	model.labels = Object.create(null);
	model.reg = this.reg;

	let pc = 0;
	let cursor = 0;
	while (cursor < tokens.length) {
		let token = tokens[cursor++];
		//1. check label. It is optional.
		if (token.name == "LABEL") {
			token.pc = pc;
			if (model.labels[token.value]) {
				console.info("Label is already defined:", token);
			}
			token.name = token.value;
			delete token.value;
			model.labels[token.name] = token;
			token = tokens[cursor++];
			if (token.name == "BR") {
				//a label can appear on its own line
				token = tokens[cursor++];
			}
		}

		//2. read the arguments / rest of the line.  This recovers parsing when there is an unknown op.
		token.args = [];
		for (let arg = tokens[cursor++]; arg.name != "BR"; arg = tokens[cursor++]) {
			token.args.push(arg);
		}
		
		//3. check for an op. It is mandatory.
		let op = token.name == "SYMBOL" && this.ops[token.value];
		if (op) {
			token.name = token.value;
			token.value = op.opcode;
			token.pc = pc;
			token.model = model;
			//4. Ensure the pc is accurate based on the arguments to the instruction.
			pc += op.count(token)
			model.instrs.push(token);
		} else {
			token.name = "BAD_INSTRUCTION";
			console.info("Invalid instruction:", token);
		}
	}
	return model;
}

function lex() {
}
