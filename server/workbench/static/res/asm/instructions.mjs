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
		type: type.noarg,
		tpl: {
			js: i => `running = false`,
			c: i => `pr->status = PS_STOPPED`
		}
	},
	nop: {
		opcode: 1,
		type: type.noarg,
		tpl: {
			js: i => ``,
			c: i => ``
		}
	},
	get: {
		opcode: 8,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] = vm.data[mode ? vm.code[vm.pc++] : vm.r[b]]`,
			c: i => `pr->r[in.a] = pr->data[in.mode ? pr->code[pr->pc++] : pr->r[in.b]]`,
			x: m => `${m.reg}[${m.a}] = ${m.data}[${m.mode} ? ${m.code}[${m.pc}++] : ${m.reg}[${m.b}]]`
		}
	},
    put: {
		opcode: 9,
		type: type.binary,
		tpl: {
			js: i => `vm.data[mode ? vm.code[vm.pc++] : vm.r[b]] = vm.r[a]`,
			c: i => ``
		}
	},
	not: {
		opcode: 13,
		type: type.unary,
		tpl: {
			js: i => `vm.r[a] = ~vm.r[a]`,
			c: i => ``
		}
	},
	neg: {
		opcode: 14,
		type: type.unary,
		tpl: {
			js: i => `vm.r[a] = -vm.r[a]`,
			c: i => ``
		}
	},
    set: {
		opcode: 15,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] = mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
    and: {
		opcode: 16,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] &= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
    or: {
		opcode: 17,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] |= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
    xor: {
		opcode: 18,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] ^= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	add: {
		opcode: 19,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] += mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	sub: {
		opcode: 20,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] -= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	mul: {
		opcode: 21,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] *= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	div: {
		opcode: 22,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] = vm.r[a] / (mode ? vm.code[vm.pc++] : vm.r[b]) & 0xFFFFFFFF`,
			c: i => ``
		}
	},
	mod: {
		opcode: 23,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] = vm.r[a] % (mode ? vm.code[vm.pc++] : vm.r[b]) & 0xFFFFFFFF`,
			c: i => ``
		}
	},
	shl: {
		opcode: 24,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] <<= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	shr: {
		opcode: 25,
		type: type.binary,
		tpl: {
			js: i => `vm.r[a] >>= mode ? vm.code[vm.pc++] : vm.r[b]`,
			c: i => ``
		}
	},
	jz: {
		opcode: 26,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] == 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	},
	jv: {
		opcode: 27,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] != 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	},
	jn: {
		opcode: 28,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] < 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	},
	jp: {
		opcode: 29,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] > 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	},
	jnz: {
		opcode: 30,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] <= 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	},
	jpz: {
		opcode: 31,
		type: type.jump,
		tpl: {
			js: i => `vm.pc += vm.r[a] >= 0 ? vm.code[vm.pc] : 1`,
			c: i => ``
		}
	}
}