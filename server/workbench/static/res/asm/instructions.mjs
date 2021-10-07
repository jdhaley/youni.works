// case OP_GET_R: A = vm->data[B];
// case OP_GET_L: A = vm->data[I];
// case OP_SET_R: A = B;
// case OP_SET_I: A = I;
// case OP_ADD_R: A += B;
// case OP_ADD_I: A += I;
// case OP_SUB:   A -= B;
// case OP_MUL:   A *= B;
// case OP_DIV:   A /= B;
// case OP_MOD:   A %= B;
// case OP_AND_R: A &= B;      
// case OP_AND_I: A &= I;
// case OP_NOT:   A = ~A;
// case OP_JZ:	  if (B == 0) vm->pc = A;
// case OP_JV:    if (B != 0) vm->pc = A;
// case OP_JN:	  if ((int32_t)  B < 0) vm->pc = A;
// case OP_JP:    if (B > 0) vm->pc = A;
// case OP_JNZ:   if (B <= 0) vm->pc = A;
// case OP_JPZ:   if (B >= 0) vm->pc = A;

const instrs = {
	hlt: {
		opcode: 0,
		argMin: 0,
		argMax: 0,
		count: instr => 1,
		vm: "running = 0;",
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
		modes: ["R", "L"],
		vm: ["vm->data[A] = B;", "vm->data[I] = B;"]
	},
    set: {
		opcode: 12,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_set,
		modes: ["R", "I"]
	},
	
    and: {
		opcode: 16,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
    or: {
		opcode: 17,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
    xor: {
		opcode: 18,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	add: {
		opcode: 19,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	sub: {
		opcode: 20,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	mul: {
		opcode: 21,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	div: {
		opcode: 22,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	mod: {
		opcode: 23,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	shl: {
		opcode: 24,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	shr: {
		opcode: 25,
		argMin: 2,
		argMax: 2,
		count: rAndImm,
		asm: asm_a_bOrNumber
	},
	jmp: {
		opcode: 56,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jsr: {
		opcode: 57,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jz: {
		opcode: 58,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jv: {
		opcode: 59,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jn: {
		opcode: 60,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jp: {
		opcode: 61,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jnz: {
		opcode: 62,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	},
	jpz: {
		opcode: 63,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asm_a_label
	}
}
//const OP_SET_I = 13;

let opcodes = "";
for (let name in instrs) {
	let instr = instrs[name];
	if (instr.modes) {
		let i = 0;
		for (let mode of instr.modes) {
			opcodes += `;\n\tconst OP_${name.toUpperCase()}_${mode.toUpperCase()} = ${instr.opcode + i++}`;
		}
	} else {
		opcodes += `;\n\tconst OP_${name.toUpperCase()} = ${instr.opcode}`;
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
	instr.seg.opcodes.push(this.opcode);
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
	instr.seg.opcodes.push(r << 8 | this.opcode);
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
function checkArgs_a(instr) {
	let args = instr.args;
	if (args.length > this.argMax) instr.warning = "Extraneous arguments will be ignored.";
	if (args.length < this.argMin) {
		instr.error = "Missing argument(s).";
		return;
	}
	if (!instr.seg.reg[args[0].value]) {
		instr.error = "Argument 'a' is not a Register name.";
		return;
	}
}

function asm_set(instr) {
	checkArgs_a.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(this.opcode | ab << 8);
		return;
	}
	let imm = 0;
	if (args[1].type == "NUMBER") {
		//op+1 a number
		imm = args[1].value * 1;
	} else if (args[1].type == "SYMBOL") {
		//op+1 a label
		let label = instr.seg.assembly.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label not defined.";
			return;
		}
		imm = label.offset;
		// if (label.seg.type.code != "d") {
		// 	console.error("Not a data label.");
		// }
		
	} else {
		instr.error = "Argument 'B' must be a Register name, numeric value, or label.";
		return;
	}
	instr.seg.opcodes.push(this.opcode + 1 | ab << 8);
	instr.seg.opcodes.push(imm);

	return;
}

//op	a b
//op+1	a ;	number
function asm_a_bOrNumber(instr) {
	checkArgs_a.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(this.opcode | ab << 8);	
	} else if (args[1].type == "NUMBER") {
		//op+1 a number
		let num = args[1].value * 1;
		instr.seg.opcodes.push(this.opcode | 1 << 6 | ab << 8);
		instr.seg.opcodes.push(num);
	} else {
		instr.error = "Argument 'B' must be a Register name or numeric value";
	}
	return;
}

//TODO calculate label + offset
//op	a b
//op+1	a ,	label number?
function asm_a_bOrLabel(instr) {
	checkArgs_a.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(this.opcode | ab << 8);
	} else if (args[1].type == "SYMBOL") {
		//op+1 a label
		let label = instr.seg.assembly.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label not defined.";
			return;
		}
		if (label.seg.type.code != "d") {
			console.error("Not a data label.");
		}
		instr.seg.opcodes.push(this.opcode + 1 | ab << 8);
		instr.seg.opcodes.push(label.offset);
	} else {
		instr.error = "Argument 'B' must be a Register name or Label name";
	}
	return;
}

function asm_a_label(instr) {
	checkArgs_a.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	if (args[1].type == "SYMBOL") {
		let label = instr.seg.assembly.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label is not defined.";
			return;
		}
		if (label.seg.type.code != "c") {
			console.error("Not a code label.");
		}
		instr.seg.opcodes.push(this.opcode | ab << 8);
		instr.seg.opcodes.push(label.offset);
	} else {
		instr.error = "Argument 'B' must be a Code Label name";
	}
	return;
}