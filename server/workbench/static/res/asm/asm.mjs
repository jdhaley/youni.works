import lex from "./lexer.mjs";
import Code from "./asmCode.mjs";
import Data from "./asmData.mjs";

const types = {
	Code: Code,
	Data: Data
}

export default function assemble(source) {
	let asm = Object.create(null);
	asm.types = types;
	asm.segments = [];
	asm.source = source;
	asm.tokens = tokenStream(source);
	asm.target = "";
	asm.encode = encode;
	asm.errors = [];
	asm.labels = Object.create(null);

	let type = asm.types.Code;
	let token = asm.tokens.peek();
	if (token.type == "SYMBOL" && asm.types[token.value]) {
		type = asm.types[token.value];
	}
	type.assemble(asm);
	asm.target = encode(asm.segments.length);
	for (let seg of asm.segments) asm.target += seg.target;
	console.log(asm);
	return asm;
}

function tokenStream(source) {
	let tokens = lex(source);
	tokens.cursor = 0;
	tokens.read = function read() {
		return this[this.cursor++];
	}
	tokens.peek = function peek() {
		return this[this.cursor];
	}
	return tokens;
}

function encode() {
	let out = "";
	for (let i = 0; i < arguments.length; i++) {
		let v = arguments[i];
		if (typeof v == "number") {
			out += encodeNumber(v);
		} else {
			for (i = 0; i < v.length; i += 2) {
				let n = v.charCodeAt(i) << 16;
				n |= (v.charCodeAt(i + 1) || 0);
				out += encodeNumber(n);
			}
		}
	}
	return out;
}
const digit = "0123456789ABCDEF";
function encodeNumber(v) {
	if (v == 0) return "+0";
	let sign = "+";
	if (v < 0 ) {
		sign = "-";
		v *= -1;
	}
	let out = "";
	for (let n = 7; n >= 0; n--) {
		let nyb = (v >> (4 * n)) & 0xF;
		out += digit[nyb];
	}
	for (let i = 0; i < out.length; i++) {
		if (out[i] != "0") return sign + out.substr(i);
	}
	return "?";
}