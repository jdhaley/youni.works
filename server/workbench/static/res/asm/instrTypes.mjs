export default {
	noarg: {
		argMin: 0,
		argMax: 0,
		count: instr => 1,
		asm: asm
	},
	unary: {
		argMin: 1,
		argMax: 1,
		count: instr => 1,
		asm: asmUnary
	},
	binary: {
		argMin: 2,
		argMax: 2,
		count: checkImm,
		asm: asmBinary
	},
	jump: {
		argMin: 2,
		argMax: 2,
		count: instr => 2,
		asm: asmJump
	}
}
//////////////////////

function asm(instr, op) {
	checkArgs.call(this, instr);
	instr.seg.opcodes.push(op.opcode);
}

//op a
function asmUnary(instr, op) {
	let args = instr.args;
	checkArgs.call(this, instr);
	checkA.call(this, instr);
	let reg = instr.seg.reg;
	let a = args[0].value;
	let r = reg[a] * 1;
	instr.seg.opcodes.push(r << 8 | op.opcode);
}

function asmBinary(instr, op) {
	checkArgs.call(this, instr);
	checkA.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(op.opcode | ab << 8);
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
	instr.seg.opcodes.push(op.opcode | 1 << 6 | ab << 8);
	instr.seg.opcodes.push(imm);

	return;
}

function asm_a_bOrLabel(instr, op) {
	checkArgs.call(this, instr);
	checkA.call(this, instr);
	let ab = get_ab(instr);

	let args = instr.args;

	let reg = instr.seg.reg;
	if (reg[args[1].value]) {
		//op a b
		instr.seg.opcodes.push(op.opcode | ab << 8);
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
		instr.seg.opcodes.push(op.opcode + 1 | ab << 8);
		instr.seg.opcodes.push(label.offset);
	} else {
		instr.error = "Argument 'B' must be a Register name or Label name";
	}
	return;
}

function asmJump(instr, op) {
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
		instr.seg.opcodes.push(op.opcode | ab << 8);
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

