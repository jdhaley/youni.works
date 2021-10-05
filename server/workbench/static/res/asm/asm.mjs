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

	let type = types.Code;
	let token = asm.tokens.peek();
	if (token.type == "SYMBOL" && asm.types[token.value]) {
		type = asm.types[token.value];
	}
	type.assemble(asm);
	for (let seg of asm.segments) asm.target += seg.header + seg.code;
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

const digit = "0123456789ABCDEF";
function encode() {
	let out = "";
	for (let i = 0; i < arguments.length; i++) {
		let v = arguments[i];
		if (typeof v == "string") {
			for (let ch of v) {
				ch = ch.charCodeAt(0);
				for (let n = 3; n >= 0; n--) {
					out += digit[(ch >> (4 * n)) & 0xF];
				}
				out += ".";
			}
		} else {
			for (let n = 3; n >= 0; n--) {
				out += digit[(v >> (4 * n)) & 0xF];
			}
			out += ".";
		}
	}
	return out;
}