const type = Object.create(null);
type.assemble = assemble;
export default type;

function create(assembly) {
	let seg = Object.create(null);
	seg.name = "";
	seg.assembly = assembly;
	seg.type = type;
	seg.errors = [];
	seg.labels = Object.create(null);
	seg.code = "";
	seg.counter = 0;

	let tokens = assembly.tokens;
	let token = tokens.peek();
	if (token.type == "SYMBOL" && assembly.types[token.value]) {
		let line = [];
		for (let arg = tokens.peek(); arg && arg.line == token.line; arg = tokens.peek()) {
			line.push(tokens.read());
		}
		if (line[1] && line[1].type == "SYMBOL") {
			seg.name = line[1].value;
		}
	}
	assembly.segments.push(seg);
	return seg;
}

function assemble(assembly) {
	let seg = create(assembly);
	parse(seg);
	seg.header = "/d" + seg.assembly.encode(seg.counter);
}

function parse(seg) {
	let tokens = seg.assembly.tokens;
	for (let token = tokens.peek(); token; token = tokens.peek()) {
		//0. check if the token is a segment directive.
		if (token.type == "SYMBOL" && seg.assembly.types[token.value]) {
			seg.assembly.types[token.value].assemble(seg.assembly);
			return;
		}
		token = tokens.read();

		switch (token.type) {
			case "LABEL": {
				token.pc = seg.counter;
				if (seg.labels[token.value]) {
					console.info("Label is already defined:", token);
				}
				token.name = token.value;
				delete token.value;
				seg.labels[token.name] = token;	
			}	break;
			case "NUMBER": {
				seg.code += seg.assembly.encode(token.value * 1);
				seg.counter++;
			}	break;
			case "COUNT": {
				let n = token.value * 1;
				if (n < 0) throw new Error("Negative count.");
				seg.code += "*" + seg.assembly.encode(n).substring(1);
				seg.counter += n;
			}	break;
			case "STRING": {
				let v = token.value + "\0";
				//Encoding converts each pair of UTF-16 characters into an encoded 32-bit value.
				seg.code += seg.assembly.encode(v);
				//Dive the string length by 2 to get the 32-bit word count.
				seg.counter += v.length / 2;
				//If the length is odd, make sure we stay aligned on 32-bits.
				if (v.length % 2) seg.counter++;
			}	break;
			default: {
				console.error("BAD TOKEN", token);
			}
		}
	}
}
