export default lex;

const CHAR_TYPES = {
	WS: " \t",
	BR: "\n",
	COMMENT: ";",
	CHAR: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",
	DIGIT: "0123456789",

	LABEL: ":",
	SIGN: "-",
	DOT: "."
}

const NEUTRAL = Object.freeze({
	type: "NEUTRAL"
});
const COMMENT = Object.freeze({
	type: "COMMENT"
});
const BR = Object.freeze({
	type: "BR"
});

function lex(source) {
	const tokens = [];

	let line = 1;
	let col = 0;
	let token = NEUTRAL;
	let cursor = 0;
	while (cursor < source.length) {
		let ch = source[cursor++];
		col++;
		switch (token.type) {
			case "NEUTRAL":
				switch (charType(ch)) {
					case "WS":
						break;
					case "BR": 
						//line breaks are WS when in neutral state.
						lineBreak();
						break;
					case "COMMENT":
						token = COMMENT;
						break;
					case "DOT":
					case "CHAR":
						token = newToken("SYMBOL", ch);
						break;
					case "SIGN":
					case "DIGIT":
						token = newToken("NUMBER", ch);
						break;
					default:
						token = newToken("BAD_CHAR", ch);
						break;
				}
				break;
			case "SYMBOL":
				switch (charType(ch)) {
					case "LABEL":
						token.type = "LABEL";
						token = NEUTRAL;
						break;
					case "CHAR":
					case "DIGIT":
						token.value += ch;
						break;
					case "COMMENT":
						newToken("BR");
						token = COMMENT;
						break;
					case "BR":
						lineBreak();
						token = newToken("BR");
						token = NEUTRAL;
						break;
					default:
						cursor--;
						col--;
						token = NEUTRAL;
						break;			
				}
				break;
			case "NUMBER":
				switch (charType(ch)) {
					case "DIGIT":
						token.value += ch;
						break;
					case "COMMENT":
						newToken("BR");
						token = COMMENT;
						break;	
					case "BR":
						lineBreak();
						token = newToken("BR");
						token = NEUTRAL;
						break;
					default:
						cursor--;
						col--;
						token = NEUTRAL;
						break;			
				}
				break;
			case "COMMENT":
				switch (charType(ch)) {
					case "BR":
						lineBreak();
						token = NEUTRAL;
						break;
					default:
						break;			
				}
				break;
		}
	}

	function lineBreak() {
		line++;
		col = 0;
	}

	function newToken(type, value) {
		let token = Object.create(null);
		token.type = type;
		token.value = value || "";
		token.line = line;
		token.column = col;
		tokens.push(token);
		return token;
	}

	return tokens;
}

function charType(ch) {
	for (let type in CHAR_TYPES) {
		if (CHAR_TYPES[type].indexOf(ch) >=  0) return type;
	}
	return "";
}
