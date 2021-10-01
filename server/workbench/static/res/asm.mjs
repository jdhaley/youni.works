const ops = {
	hlt: {
		opcode: 0,
		count: instr => 1,
		asm: (model, number) => {
		}
	},
	not: {
		opcode: 1,
		count: instr => 1,
		asm: (model, number) => {
			instr = model.code[number];
			if (!inst.a) console.info("Missing 'a' argument:", instr);
			inst.value = [instr.value, inst.a];
		}
	},
    set: {
		opcode: 4,
		count: rAndImm,
		asm: (model, number) => {
			instr = model.code[number];
			if (!inst.a) console.info("Missing 'a' argument:", instr);
			if (inst.imm) {

				inst.value[0] += 2;
			}
			let a = inst.a * 1 || 0;
			let b = inst.b * 1 || 0;
			inst.value = [instr.value, a | (b << 3)];
			if (inst.imm) {
				inst.value.push(imm >> 8);
				inst.value.push(imm | 0xFF);
			}
		}
	},
    get: {
		opcode: 8,
		count: rAndImm,
		asm: (model, number) => {
		}
	},
    put: {
		opcode: 12,
		count: rAndImm,
		asm: (model, number) => {
		}
	},
    add: {
		opcode: 16,
		count: rAndImm,
		asm: (model, number) => {
		}
	},
    and: {
		opcode: 20,
		count: rAndImm,
		asm: (model, number) => {
		}
	},
	br: {
		opcode: 24,
		count: instr => 2,
		asm: (model, number) => {
		}
	}
}

function rAndImm(instr) {
	for (let arg of instr.args) {
		//If not a register symbol, assume it is a following argument.
		if (!reg[arg.value]) return 2;
	}
	return 1;
}

// function parseInstruction(instr, args) {
// 	let argCount = 0;
// 	let arg = args[0];
// 	if (arg && arg.name == "SYMBOL" && reg[arg.value]) {
// 		instr.a = reg[arg.value];
// 		arg = args[++argCount];
// 		if (arg && arg.name == "SYMBOL" && reg[arg.value]) {
// 			instr.b = reg[arg.value];
// 			arg = args[++argCount];
// 		}
// 	}
// 	if (arg) {
// 		++argCount;
// 		switch (arg.name) {
// 			case "SYMBOL":
// 			case "NUMBER":
// 				instr.imm = arg.value;
// 		}
// 	}
// 	if (args.length > argCount) {
// 		console.info("Too many arguments starting at:", args[argCount]);
// 	}

// 	return instr.imm ? 2 : 1;
// }

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
	for (let i = 0; i < model.code.length; i++) {
		ops[model.code[i].name].asm(model, i);
	}
	return model;
}

function parse(tokens) {
	let model = Object.create(null);
	model.code = [];
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
			model.code.push(token);
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
