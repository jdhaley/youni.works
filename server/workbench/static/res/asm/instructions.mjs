const instrs = {
	hlt: {
		opcode: 0,
		argMin: 0,
		argMax: 0,
		count: instr => 1,
		asm: asm
	},
	not: {
		opcode: 4,
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
		asm: asm_a_bOrLabel,
		modes: ["R", "L"]
	},
    put: {
		opcode: 10,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrLabel,
		modes: ["R", "L"]
	},
    set: {
		opcode: 12,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber,
		modes: ["R", "I"]
	},
    and: {
		opcode: 14,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber,
		modes: ["R", "I"]
	},
	add: {
		opcode: 16,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber,
		modes: ["R", "I"]
	},
	sub: {
		opcode: 18,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	mul: {
		opcode: 19,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	div: {
		opcode: 20,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	mod: {
		opcode: 21,
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
	jv: {
		opcode: 27,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jn: {
		opcode: 28,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jp: {
		opcode: 29,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jnz: {
		opcode: 30,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jpz: {
		opcode: 31,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	}
}
let opcodes = "";
for (let name in instrs) {
	let instr = instrs[name];
	if (instr.modes) {
		let i = 0;
		for (let mode of instr.modes) {
			opcodes += `,\n\tOP_${name.toUpperCase()}_${mode.toUpperCase()} = ${instr.opcode + i++}`;
		}
	} else {
		opcodes += `,\n\tOP_${name.toUpperCase()} = ${instr.opcode}`;
	}
}
opcodes = opcodes.substring(2);
console.log(opcodes);
export default instrs;
//////////////////////

function rAndImm(instr) {
	for (let arg of instr.args) {
		//If not a register symbol, assume it is a following argument.
		if (!instr.seg.reg[arg.value]) return 2;
	}
	return 1;
}

function asm(instr) {
	instr.code = instr.seg.assembly.encode(this.opcode, 0);
}

//op a
function asm_a(instr) {
	let args = instr.args;
	if (!args.length) {
		instr.error = "Missing Register argument.";
		return;
	}
	let reg = instr.seg.reg;
	let a = args[0].value;
	if (!reg[a]) {
		instr.error = "Argument is not a Register name.";
		return;
	}
	if (args.length > 1) {
		instr.warning = "Extraneous arguments will be ignored.";
	}
	let r = reg[a] * 1;
	instr.code = instr.seg.assembly.encode(this.opcode, r);
}

// a b?
function get_ab(instr) {
	let reg = instr.seg.reg;
	let args = instr.args;
	let a = reg[args[0].value] * 1;
	let b = 0;
	if (reg[args[1].value]) {
		b = reg[args[1].value] * 1;
	}
	return a | (b << 3);
}
function checkArgs_a(instr, op) {
	let args = instr.args;
	if (args.length > op.argMax) instr.warning = "Extraneous arguments will be ignored.";
	if (args.length < op.argMin) {
		instr.error = "Missing argument(s).";
		return;
	}
	if (!instr.seg.reg[args[0].value]) {
		instr.error = "Argument 'a' is not a Register name.";
		return;
	}
}
//op	a b
//op+1	a ;	number
function asm_a_bOrNumber(instr) {
	checkArgs_a(instr, this);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.code = instr.seg.assembly.encode(this.opcode, ab);	
	} else if (args[1].type == "NUMBER") {
		//op+1 a number
		let num = args[1].value * 1;
		instr.code = instr.seg.assembly.encode(this.opcode + 1, ab, num & 0xFF, num >> 8);
	} else {
		instr.error = "Argument 'B' must be a Register name or numeric value";
	}
	return;
}

//TODO calculate label + offset
//op	a b
//op+1	a ,	label number?
function asm_a_bOrLabel(instr) {
	checkArgs_a(instr, this);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.code = instr.seg.assembly.encode(this.opcode, ab);	
	} else if (args[1].type == "SYMBOL") {
		//op+1 a label
		let label = instr.seg.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label not defined.";
			return;
		}
		instr.code = instr.seg.assembly.encode(this.opcode + 1, ab, label.pc & 0xFF, label.pc >> 8);
	} else {
		instr.error = "Argument 'B' must be a Register name or Label name";
	}
	return;
}

function asm_a_label(instr) {
	checkArgs_a(instr, this);
	let ab = get_ab(instr);

	let args = instr.args;

	if (args[1].type == "SYMBOL") {
		let label = instr.seg.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label is not defined.";
			return;
		}
		instr.code = instr.seg.assembly.encode(this.opcode, ab, label.pc & 0xFF, label.pc >> 8);
	} else {
		instr.error = "Argument 'B' must be a Code Label name";
	}
	return;
}