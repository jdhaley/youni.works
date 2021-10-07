const OP_HLT = 0;
const OP_NOT = 4;
const OP_GET_R = 8;
const OP_GET_L = 9;
const OP_PUT_R = 10;
const OP_PUT_L = 11;
const OP_SET_R = 12;
const OP_SET_I = 13;
const OP_AND_R = 14;
const OP_AND_I = 15;
const OP_ADD_R = 16;
const OP_ADD_I = 17;
const OP_SUB = 18;
const OP_MUL = 19;
const OP_DIV = 20;
const OP_MOD = 21;
const OP_JMP = 24;
const OP_JSR = 25;
const OP_JZ = 26;
const OP_JV = 27;
const OP_JN = 28;
const OP_JP = 29;
const OP_JNZ = 30;
const OP_JPZ = 31;


export default function exec(vm) {
	function I() {
		return vm.code[vm.pc++];
	}
	let running = true;
    while (running) {
		let i = vm.code[vm.pc++];
		let a = i >> 8 & 7;
		let b = i >> 11 & 7;
        switch (i & 31) {
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
                vm.r[a] = vm.data[vm.pc++];
                break;
            case OP_SET_R:
                vm.r[a] = vm.r[b];
                break;
            case OP_SET_I:
                vm.r[a] = vm.code[vm.pc++];
                break;
            case OP_ADD_R:
                vm.r[a] += vm.r[b];
                break;
            case OP_ADD_I:
                vm.r[a] += vm.code[vm.pc++];
                break;
            case OP_SUB:
                vm.r[a] -= vm.r[b];
                break;
            case OP_MUL:
                vm.r[a] *= vm.r[b];
                break;
            case OP_DIV:
                vm.r[a] /= vm.r[b];
                break;
            case OP_MOD:
				vm.r[a] %= vm.r[b];
                break;       
            case OP_AND_R:
                vm.r[a] &= vm.r[b];
                break;       
            case OP_AND_I:
                vm.r[a] &= vm.code[vm.pc++];
                break;       
            case OP_NOT:
                vm.r[a] = ~vm.r[a];
                break;
            case OP_JZ:
                if (vm.r[b] == 0) vm.pc = vm.r[a];
                break;
            case OP_JV:
                if (vm.r[b] != 0) vm.pc = vm.r[a];
                break;
            case OP_JN:
                if (vm.r[b] < 0) vm.pc = vm.r[a];
                break;
            case OP_JP:
                if (vm.r[b] > 0) vm.pc = vm.r[a];
                break;
            case OP_JNZ:
                if (vm.r[b] <= 0) vm.pc = vm.r[a];
                break;
            case OP_JPZ:
                if (vm.r[b] >= 0) vm.pc = vm.r[a];
                break;
            default:
                /* BAD OPCODE */
                break;
        }
    }
}