const OP_HLT = 0;
const OP_NOP = 1;
const OP_GET = 8;
const OP_PUT = 9;
const OP_NOT = 13;
const OP_NEG = 14;
const OP_SET = 15;
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
const OP_JZ = 26;
const OP_JV = 27;
const OP_JN = 28;
const OP_JP = 29;
const OP_JNZ = 30;
const OP_JPZ = 31;

export default function exec(vm) {
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
            case OP_NOP:
                break;
            case OP_PUT:
                vm.data[mode ? vm.code[vm.pc++] : vm.r[b]] = vm.r[a];
                break;
            case OP_GET:
                vm.r[a] = vm.data[mode ? vm.code[vm.pc++] : vm.r[b]];
                break;
            case OP_SET:
                vm.r[a] = mode ? vm.code[vm.pc++] : vm.r[b];
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
            case OP_NEG:
                vm.r[a] = -vm.r[a];
                break;    
            case OP_JZ:
				vm.pc += vm.r[a] == 0 ? vm.code[vm.pc] : 1;
                break;
            case OP_JV:
				vm.pc += vm.r[a] != 0 ? vm.code[vm.pc] : 1;
                break;
            case OP_JN:
				vm.pc += vm.r[a]  < 0 ? vm.code[vm.pc] : 1;
                break;
            case OP_JP:
				vm.pc += vm.r[a]  > 0 ? vm.code[vm.pc] : 1;
                break;
            case OP_JNZ:
				vm.pc += vm.r[a] <= 0 ? vm.code[vm.pc] : 1;
                break;
            case OP_JPZ:
				vm.pc += vm.r[a] >= 0 ? vm.code[vm.pc] : 1;
                break;
            default:
                /* BAD OPCODE */
                break;
        }
    }
}