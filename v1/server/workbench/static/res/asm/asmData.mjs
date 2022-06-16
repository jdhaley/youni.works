const type = Object.create(null);
type.code = "d";
type.assemble = assemble;
export default type;

function create(assembly) {
	let seg = Object.create(null);
	seg.name = "";
	seg.assembly = assembly;
	seg.type = type;
	seg.errors = [];
	seg.target = "";
	seg.counter = 0;
	seg.data = [];

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
	seg.target = "/" + seg.type.code + seg.assembly.encode(seg.counter) + seg.target;
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
				token.offset = seg.counter;
				if (seg.assembly.labels[token.value]) {
					console.info("Label is already defined:", token);
				}
				token.name = token.value;
				token.seg = seg;
				delete token.value;
				seg.assembly.labels[token.name] = token;	
			}	break;
			case "NUMBER": {
				seg.target += seg.assembly.encode(token.value * 1);
				seg.data[seg.counter] = (token.value * 1);
				seg.counter++;
			}	break;
			case "COUNT": {
				let n = token.value * 1;
				if (n < 0) throw new Error("Negative count.");
				// TODO should these be added to the seg.data?
				seg.target += "*" + seg.assembly.encode(n).substring(1);
				seg.counter += n;
			}	break;
			case "STRING": {
				// TODO add string data to the .data
				let v = token.value + "\0";
				//Encoding converts each pair of UTF-16 characters into an encoded 32-bit value.
				seg.target += seg.assembly.encode(v);
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
