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
		asm: asmUnary
	},
	neg: {
		opcode: 5,
		argMin: 1,
		argMax: 1,
		count: instr => 1,
		asm: asmUnary
	},
	get: {
		opcode: 8,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
    put: {
		opcode: 10,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
    set: {
		opcode: 15,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
    and: {
		opcode: 16,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
    or: {
		opcode: 17,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
    xor: {
		opcode: 18,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	add: {
		opcode: 19,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	sub: {
		opcode: 20,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	mul: {
		opcode: 21,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	div: {
		opcode: 22,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	mod: {
		opcode: 23,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	shl: {
		opcode: 24,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	shr: {
		opcode: 25,
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	jmp: {
		opcode: 56,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jsr: {
		opcode: 57,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jz: {
		opcode: 58,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jv: {
		opcode: 59,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jn: {
		opcode: 60,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jp: {
		opcode: 61,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jnz: {
		opcode: 62,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	},
	jpz: {
		opcode: 63,
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
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

function asm(instr) {
	checkArgs.call(this, instr);
	instr.seg.opcodes.push(this.opcode);
}

//op a
function asmUnary(instr) {
	let args = instr.args;
	checkArgs.call(this, instr);
	checkA.call(this, instr);
	let reg = instr.seg.reg;
	let a = args[0].value;
	let r = reg[a] * 1;
	instr.seg.opcodes.push(r << 8 | this.opcode);
}

function asmBinary(instr) {
	checkArgs.call(this, instr);
	checkA.call(this, instr);
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
		//op a number
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
	instr.seg.opcodes.push(this.opcode | 1 << 6 | ab << 8);
	instr.seg.opcodes.push(imm);

	return;
}

function asm_a_bOrLabel(instr) {
	checkArgs.call(this, instr);
	checkA.call(this, instr);
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

function asmJump(instr) {
	checkArgs.call(this, instr);
	checkA.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	if (args[1].type == "SYMBOL") {
		let label = instr.seg.assembly.labels[args[1].value];
		if (!label) {
			instr.error = "Jump target Label is not defined.";
			return;
		}
		if (label.seg != instr.seg) {
			instr.error = "Jump target must be a Label name in the current segment.";
			return;
		}
		console.log("Relative jump", label.offset - instr.offset - 1);
		instr.seg.opcodes.push(this.opcode | ab << 8);
		//subtract 1 from the instruction offset because the PC was just incremented for the instruction.
		instr.seg.opcodes.push(label.offset - instr.offset - 1);
	} else {
		instr.error = "Jump target must be a Label name in the current segment.";
	}
	return;
}
/////////
function checkImm(instr) {
	for (let arg of instr.args) {
		//If not a register symbol, assume it is a following argument.
		if (!instr.seg.reg[arg.value]) return 2;
	}
	return 1;
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

function checkArgs(instr) {
	let args = instr.args;
	if (args.length > this.argMax) instr.warning = "Extraneous arguments will be ignored.";
	if (args.length < this.argMin) {
		instr.error = "Missing argument(s).";
	}
}
function checkA(instr) {
	if (instr.args[0] && instr.seg.reg[instr.args[0].value]) return;
	instr.error = "First argument must be a Register name.";
}