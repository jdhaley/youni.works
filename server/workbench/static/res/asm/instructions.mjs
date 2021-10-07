import type from "./instrTypes.mjs";

export default {
	hlt: {
		opcode: 0,
		type: type.noarg
	},
	not: {
		opcode: 4,
		type: type.unary
	},
	neg: {
		opcode: 5,
		type: type.unary
	},
	get: {
		opcode: 8,
		type: type.binary
	},
    put: {
		opcode: 10,
		type: type.binary
	},
    set: {
		opcode: 15,
		type: type.binary
	},
    and: {
		opcode: 16,
		type: type.binary
	},
    or: {
		opcode: 17,
		type: type.binary
	},
    xor: {
		opcode: 18,
		type: type.binary
	},
	add: {
		opcode: 19,
		type: type.binary
	},
	sub: {
		opcode: 20,
		type: type.binary
	},
	mul: {
		opcode: 21,
		type: type.binary
	},
	div: {
		opcode: 22,
		type: type.binary
	},
	mod: {
		opcode: 23,
		type: type.binary
	},
	shl: {
		opcode: 24,
		type: type.binary
	},
	shr: {
		opcode: 25,
		type: type.binary
	},
	// jmp: {
	// 	opcode: 56,
	// 	argMin: 2,
	// 	argMax: 2,
	// 	count: instr => 2,
	// 	asm: asmJump
	// },
	// jsr: {
	// 	opcode: 57,
	// 	argMin: 2,
	// 	argMax: 2,
	// 	count: instr => 2,
	// 	asm: asmJump
	// },
	jz: {
		opcode: 58,
		type: type.jump
	},
	jv: {
		opcode: 59,
		type: type.jump
	},
	jn: {
		opcode: 60,
		type: type.jump
	},
	jp: {
		opcode: 61,
		type: type.jump
	},
	jnz: {
		opcode: 62,
		type: type.jump
	},
	jpz: {
		opcode: 63,
		type: type.jump
	}
}