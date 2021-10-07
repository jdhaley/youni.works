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
		instr.seg.opcodes.push(this.opcode | ab << 8);	
	} else if (args[1].type == "NUMBER") {
		//op+1 a number
		let num = args[1].value * 1;
		instr.seg.opcodes.push(this.opcode + 1 | ab << 8);
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
	checkArgs_a(instr, this);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(this.opcode | ab << 8);
	} else if (args[1].type == "SYMBOL") {
		//op+1 a label
		let label = instr.seg.labels[args[1].value];
		if (!label) {
			instr.error = "Argument 'B' Label not defined.";
			return;
		}
		instr.seg.opcodes.push(this.opcode + 1 | ab << 8);
		instr.seg.opcodes.push(label.pc);
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
		instr.seg.opcodes.push(this.opcode | ab << 8);
		instr.seg.opcodes.push(label.pc);
	} else {
		instr.error = "Argument 'B' must be a Code Label name";
	}
	return;
}