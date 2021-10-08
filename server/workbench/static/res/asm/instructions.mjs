import type from "./instrTypes.mjs";
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

export default {
	hlt: {
		opcode: 0,
		type: type.noarg
	},
	nop: {
		opcode: 1,
		type: type.noarg
	},
	get: {
		opcode: 8,
		type: type.binary
	},
    put: {
		opcode: 9,
		type: type.binary
	},
	not: {
		opcode: 13,
		type: type.unary
	},
	neg: {
		opcode: 14,
		type: type.unary
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
	jz: {
		opcode: 26,
		type: type.jump
	},
	jv: {
		opcode: 27,
		type: type.jump
	},
	jn: {
		opcode: 28,
		type: type.jump
	},
	jp: {
		opcode: 29,
		type: type.jump
	},
	jnz: {
		opcode: 30,
		type: type.jump
	},
	jpz: {
		opcode: 31,
		type: type.jump
	}
}