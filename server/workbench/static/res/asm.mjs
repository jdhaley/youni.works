function asm(model, number) {
	let instr = model.instrs[number];
	instr.code = String.fromCharCode(this.opcode | 1 << 14);
}

//op a
function asm_a(model, number) {
	let instr = model.instrs[number];
	let args = instr.args;
	if (!args.length) {
		instr.error = "Missing Register argument.";
		return;
	}
	let a = args[0].value;
	if (!reg[a]) {
		instr.error = "Argument is not a Register name.";
		return;
	}
	if (args.length > 1) {
		instr.warning = "Extraneous arguments will be ignored.";
	}
	let r = reg[a] * 1;
	instr.code = String.fromCharCode(this.opcode | (r << 8) | 1 << 14);
}

// a b?
function get_ab(args) {
	let a = reg[args[0].value] * 1;
	let b = 0;
	if (reg[args[1].value]) {
		b = reg[args[1].value] * 1;
	}
	return a | (b << 3);
}
function checkArgs_a(instr) {
	let args = instr.args;
	let op = ops[instr.name];
	if (args.length > op.argMax) instr.warning = "Extraneous arguments will be ignored.";
	if (args.length < op.argMin) {
		instr.error = "Missing argument(s).";
		return;
	}
	if (!reg[args[0].value]) {
		instr.error = "Argument 'a' is not a Register name.";
		return;
	}
}
//op	a b
//op+1	a ;	number
function asm_a_bOrNumber(model, number) {
	let instr = model.instrs[number];
	checkArgs_a(instr);
	let args = instr.args;
	let ab = get_ab(args);

	if (reg[args[1].value]) {
		//op a b
		instr.code = String.fromCharCode(this.opcode | (ab << 8) | 1 << 14);	
	} else if (args[1].name == "NUMBER") {
		//op+1 a number
		instr.code = String.fromCharCode(this.opcode + 1 | (ab << 8) | 1 << 14);
		instr.code += String.fromCharCode(args[1].value * 1);	
	} else {
		instr.error = "Argument 'B' must be a Register name or numeric value";
	}
	return;
}

//TODO calculate label + offset
//op	a b
//op+1	a ,	label number?
function asm_a_bOrLabel(model, number) {
	let instr = model.instrs[number];
	checkArgs_a(instr);
	let args = instr.args;
	let ab = get_ab(args);

	if (reg[args[1].value]) {
		//op a b
		instr.code = String.fromCharCode(this.opcode | (ab << 8) | (1 << 14));	
	} else if (args[1].name == "SYMBOL") {
		//op+1 a label
		let label = model.labels[args[1].name];
		if (!label) {
			instr.error = "Argument 'B' Label not defined.";
			return;
		}
		instr.code = String.fromCharCode(this.opcode + 1 | (r << 8) | (1 << 14));
		instr.code += String.fromCharCode(label.pc);
	} else {
		instr.error = "Argument 'B' must be a Register name or Label name";
	}
	return;
}

function asm_a_label(model, number) {
	let instr = model.instrs[number];
	checkArgs_a(instr);
	let args = instr.args;
	let ab = get_ab(args);

	if (args[1].name == "SYMBOL") {
		let label = model.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label is not defined.";
			return;
		}
		instr.code = String.fromCharCode(this.opcode | (ab << 8) | (1 << 14));
		instr.code += String.fromCharCode(label.pc);
	} else {
		instr.error = "Argument 'B' must be a Code Label name";
	}
	return;
}

const ops = {
	hlt: {
		opcode: 0,
		argMin: 0,
		argMax: 0,
		count: instr => 1,
		asm: asm
	},
	not: {
		opcode: 1,
		argMin: 1,
		argMax: 1,
		count: instr => 1,
		asm: asm_a
	},
	get: {
		opcode: 8,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrLabel
	},
    put: {
		opcode: 12,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrLabel
	},
    set: {
		opcode: 4,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
    add: {
		opcode: 16,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
    and: {
		opcode: 20,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	jmp: {
		opcode: 24,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jsr: {
		opcode: 25,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jz: {
		opcode: 26,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jzn: {
		opcode: 27,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jzp: {
		opcode: 28,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jv: {
		opcode: 29,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jvn: {
		opcode: 30,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jvp: {
		opcode: 31,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	}
}

function rAndImm(instr) {
	for (let arg of instr.args) {
		//If not a register symbol, assume it is a following argument.
		if (!reg[arg.value]) return 2;
	}
	return 1;
}

const reg = {
	r0: "0",
	r1: "1",
	r2: "2",
	r3: "3",
	r4: "4",
	r5: "5",
	r6: "6",
	r7: "7"
}

const machineType = {
	reg: reg,
	ops: ops,
	assemble: assemble,
	parse: parse
}

export default function assemble(source) {
	let tokens = tokenize(source);
	let model = parse(tokens);
	for (let i = 0; i < model.instrs.length; i++) {
		ops[model.instrs[i].name].asm(model, i);
	}
	let code = "";
	for (let instr of model.instrs) {
		if (instr.error) return "";
		if (instr.code) code += instr.code;
	}
	model.code = code;
	return model;
}

function parse(tokens) {
	let model = Object.create(null);
	model.instrs = [];
	model.labels = Object.create(null);

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
		let op = token.name == "SYMBOL" && ops[token.value];
		if (op) {
			token.name = token.value;
			token.value = op.opcode;
			token.pc = pc;
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

const CHAR_TYPES = {
	WS: " \t",
	BR: "\n",
	COMMENT: ";",
	CHAR: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",
	DIGIT: "0123456789",
	LABEL: ":",
	SIGN: "-",
	DOT: "."
}

const NEUTRAL = Object.freeze({
	name: "NEUTRAL"
});
const COMMENT = Object.freeze({
	name: "COMMENT"
});
const BR = Object.freeze({
	name: "BR"
});

function tokenize(source) {
	const tokens = [];

	let line = 1;
	let col = 0;
	let token = NEUTRAL;
	let cursor = 0;
	while (cursor < source.length) {
		let ch = source[cursor++];
		col++;
		switch (token.name) {
			case "NEUTRAL":
				switch (charType(ch)) {
					case "WS":
						break;
					case "BR": 
						//line breaks are WS when in neutral state.
						lineBreak();
						break;
					case "COMMENT":
						token = COMMENT;
						break;
					case "DOT":
					case "CHAR":
						token = newToken("SYMBOL", ch);
						break;
					case "SIGN":
					case "DIGIT":
						token = newToken("NUMBER", ch);
						break;
					default:
						token = newToken("BAD_CHAR", ch);
						break;
				}
				break;
			case "SYMBOL":
				switch (charType(ch)) {
					case "LABEL":
						token.name = "LABEL";
						token = NEUTRAL;
						break;
					case "CHAR":
					case "DIGIT":
						token.value += ch;
						break;
					case "COMMENT":
						newToken("BR");
						token = COMMENT;
						break;
					case "BR":
						lineBreak();
						token = newToken("BR");
						token = NEUTRAL;
						break;
					default:
						cursor--;
						col--;
						token = NEUTRAL;
						break;			
				}
				break;
			case "NUMBER":
				switch (charType(ch)) {
					case "DIGIT":
						token.value += ch;
						break;
					case "COMMENT":
						newToken("BR");
						token = COMMENT;
						break;	
					case "BR":
						lineBreak();
						token = newToken("BR");
						token = NEUTRAL;
						break;
					default:
						cursor--;
						col--;
						token = NEUTRAL;
						break;			
				}
				break;
			case "COMMENT":
				switch (charType(ch)) {
					case "BR":
						lineBreak();
						token = NEUTRAL;
						break;
					default:
						break;			
				}
				break;
		}
	}

	function lineBreak() {
		line++;
		col = 0;
	}

	function newToken(name, value) {
		let token = Object.create(null);
		token.name = name;
		token.value = value || "";
		token.line = line;
		token.column = col;
		tokens.push(token);
		return token;
	}

	return tokens;
}

function charType(ch) {
	for (let type in CHAR_TYPES) {
		if (CHAR_TYPES[type].indexOf(ch) >=  0) return type;
	}
	return "";
}
