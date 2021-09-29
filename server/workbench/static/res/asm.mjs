export default function assemble(source) {
	let tokens = tokenize(source);
	let model = parse(tokens);
	return model;
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

const ops = {
	hlt: {
		opcode: 0,
	},
	not: {
		opcode: 1,
		a: 1
	},
    set: {
		opcode: 4,
		a: 1,
		b: 3
	},
    get: {
		opcode: 8,
		a: 1,
		b: 3
	},
    put: {
		opcode: 12,
		a: 1,
		b: 3
	},
    add: {
		opcode: 16,
		a: 1,
		b: 3
	},
    and: {
		opcode: 20,
		a: 1,
		b: 3
	},
	br: {
		opcode: 24,
		a: 1,
		b: 1,
		// I_BE,   // b == 0
		// I_BN,   // b != 0
		// I_BL,   // b <  0
		// I_BG,   // b >  0
		// I_BLE,  // b <= 0
		// I_BGE,  // b >= 0		
	}
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
		//2. check for an op. It is mandatory.
		let op = token.name == "SYMBOL" && ops[token.value];
		if (op) {
			token.name = token.value;
			token.value = op.opcode;
			token.pc = pc;
			model.code.push(token);
		} else {
			token.name = "BAD_INSTRUCTION";
			console.info("Invalid instruction:", token);
		}

		//3. read the arguments / rest of the line.  This recovers parsing when there is an unknown op.
		let args = [];
		for (let arg = tokens[cursor++]; arg.name != "BR"; arg = tokens[cursor++]) {
			args.push(arg);
		}
		
		//4. parse the instruction token. Critical thing for now is increment the pc correctly.
		pc += parseInstruction(token, args)
	}
	return model;
}

function parseInstruction(instr, args) {
	let argCount = 0;
	let arg = args[0];
	if (arg && arg.name == "SYMBOL" && reg[arg.value]) {
		instr.a = reg[arg.value];
		arg = args[++argCount];
		if (arg && arg.name == "SYMBOL" && reg[arg.value]) {
			instr.b = reg[arg.value];
			arg = args[++argCount];
		}
	}
	if (arg) {
		++argCount;
		switch (arg.name) {
			case "SYMBOL":
			case "NUMBER":
				instr.imm = arg.value;
		}
	}
	if (args.length > argCount) {
		console.info("Too many arguments starting at:", args[argCount]);
	}

	return instr.imm ? 2 : 1;
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
