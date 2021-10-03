import lex from "./lexer.mjs";
import Code from "./asmCode.mjs";

const types = {
	Code: Code,
	Data: null
}

export default function assemble(source) {
	let asm = Object.create(null);
	asm.types = types;
	asm.segments = [];
	asm.source = source;
	asm.tokens = tokenStream(source);
	asm.target = "";

	let type = types.Code;
	let token = asm.tokens.peek();
	if (token.type == "SYMBOL" && asm.types[token.value]) {
		type = asm.types[token.value];
	}
	type.assemble(asm);
	for (let seg of asm.segments) asm.target += seg.code;
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