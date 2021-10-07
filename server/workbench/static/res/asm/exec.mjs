	const OP_HLT = 0;
	const OP_NOT = 4;
	const OP_GET_R = 8;
	const OP_GET_L = 9;
	const OP_PUT_R = 10;
	const OP_PUT_L = 11;
	const OP_SET_R = 12;
	const OP_SET_I = 13;
	const OP_AND = 16;
	const OP_OR = 17;
	const OP_XOR = 18;
	const OP_ADD = 19;
	const OP_SUB = 20;
	const OP_MUL = 21;
	const OP_DIV = 22;
	const OP_MOD = 23;
	const OP_SHL = 24;
	const OP_SHR = 25;
	const OP_JMP = 56;
	const OP_JSR = 57;
	const OP_JZ = 58;
	const OP_JV = 59;
	const OP_JN = 60;
	const OP_JP = 61;
	const OP_JNZ = 62;
	const OP_JPZ = 63;

export default function exec(vm) {
	function I() {
		return vm.code[vm.pc++];
	}
	let running = true;
    while (running) {
		let i = vm.code[vm.pc++];
		let mode = i >> 6 & 3;
		let a = i >> 8 & 7;
		let b = i >> 11 & 7;
        switch (i & 63) {
            case OP_HLT:
                running = false;
                break;
            case OP_PUT_R:
                vm.data[vm.r[b]] = vm.r[a];
                break;
            case OP_PUT_L:
                vm.data[vm.code[vm.pc++]] = vm.r[a];
                break;
            case OP_GET_R:
                vm.r[a] = vm.data[vm.r[b]];
                break;
            case OP_GET_L:
                vm.r[a] = vm.data[vm.code[vm.pc++]];
                break;
            case OP_SET_R:
                vm.r[a] = vm.r[b];
                break;
            case OP_SET_I:
                vm.r[a] = vm.code[vm.pc++];
                break;
            case OP_ADD:
                vm.r[a] += mode ? vm.code[vm.pc++] : vm.r[b];
                break;
            case OP_SUB:
                vm.r[a] -= mode ? vm.code[vm.pc++] : vm.r[b];
                break;
            case OP_MUL:
                vm.r[a] *= mode ? vm.code[vm.pc++] : vm.r[b];
                break;
            case OP_DIV:
                vm.r[a] /= mode ? vm.code[vm.pc++] : vm.r[b];
                break;
            case OP_MOD:
                vm.r[a] %= mode ? vm.code[vm.pc++] : vm.r[b];
                break;       
            case OP_AND:
                vm.r[a] &= mode ? vm.code[vm.pc++] : vm.r[b];
                break;       
            case OP_OR:
                vm.r[a] |= mode ? vm.code[vm.pc++] : vm.r[b];
                break;
			case OP_XOR:
				vm.r[a] ^= mode ? vm.code[vm.pc++] : vm.r[b];
				break;
			case OP_SHL:
				vm.r[a] <<= mode ? vm.code[vm.pc++] : vm.r[b];
				break;
			case OP_SHR:
				vm.r[a] >>= mode ? vm.code[vm.pc++] : vm.r[b];
				break;
			case OP_NOT:
                vm.r[a] = ~vm.r[a];
                break;
            case OP_JZ:
				vm.pc = vm.r[a] == 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            case OP_JV:
				vm.pc = vm.r[a] != 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            case OP_JN:
				vm.pc = vm.r[a]  < 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            case OP_JP:
				vm.pc = vm.r[a]  > 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            case OP_JNZ:
				vm.pc = vm.r[a] <= 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            case OP_JPZ:
				vm.pc = vm.r[a] >= 0 ? vm.code[vm.pc] : vm.pc + 1;
                break;
            default:
                /* BAD OPCODE */
                break;
        }
    }
}