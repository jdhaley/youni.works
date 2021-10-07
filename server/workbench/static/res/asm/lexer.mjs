export default lex;

const CHAR_TYPES = {
	WS: " \t\n",
	COMMENT: ";",
	LETTER: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$",
	DIGIT: "0123456789",

	STRING: "\"",
	LABEL: ":",
	SIGN: "-",
	COUNT: "*"
}

const NEUTRAL = Object.freeze({
	type: "NEUTRAL"
});
const COMMENT = Object.freeze({
	type: "COMMENT"
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
						if (ch == "\n") lineBreak();
						break;
					case "COMMENT":
						token = COMMENT;
						break;
					case "LETTER":
						token = newToken("SYMBOL", ch);
						break;
					case "STRING":
						token = newToken("STRING"); //exclude delimiters from the value.
						break;
					case "COUNT":
						token = newToken("COUNT");
						break;
					case "SIGN":
					case "DIGIT":
						token = newToken("NUMBER", ch);
						break;
					default:
						token = newToken("BAD_LETTER", ch);
						break;
				}
				break;
			case "COMMENT":
				if (ch == "\n") {
					cursor--;
					col--;
					token = NEUTRAL;
				}
				break;
			case "SYMBOL":
				switch (charType(ch)) {
					case "LETTER":
					case "DIGIT":
						token.value += ch;
						break;
					case "LABEL":
						token.type = "LABEL";
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
			case "COUNT":
				switch (charType(ch)) {
					case "DIGIT":
						token.value += ch;
						break;
					default:
						cursor--;
						col--;
						token = NEUTRAL;
						break;			
				}
				break;
			case "STRING": {
				if (ch == "\"" && token.value[token.value.length - 1] != "\\") {
					token = NEUTRAL;
				} else {
					token.value += ch;
				}
				break;
			}
			default:
				throw new Error("Internal Error.");
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
