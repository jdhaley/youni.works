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
function encodeNumber(v) {
	if (v == 0) return "+0";

	//Encode using a sign so that small negative numbers are kept short.
	let out = v < 0 ? "-" : "+";
	if (v < 0) v = -v;

	// The value is encoded in little-endian 6-bit digits
	let zero = 48 //ASCII value for zero.
	while (v) {
		//Convert the least significant 6 bits into a digit.
		out += String.fromCharCode((v & 63) + zero);
		//Move the next higher 6 bits into the least significant position for encoding.
		v >>= 6;
	}
	return out;
}