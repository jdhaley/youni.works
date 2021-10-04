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
				let v = token.value * 1;
				seg.code += String.fromCharCode(v & 0xFFFF);
				seg.code += String.fromCharCode((v >> 16) & 0xFFFF);
				seg.counter++;
			}	break;
			case "COUNT": {
				let len = token.value;
				let zero = String.fromCharCode(0) + String.fromCharCode(0);
				for (let i = 0; i < len; i++) {
					seg.code += zero;
				}
				seg.counter += len;
			}	break;
			case "STRING": {
				let v = token.value;
				for (let i = 0; i < v.length; i++) {
					seg.code += v[i];
				}
				seg.code += String.fromCharCode(0);
				//Pad strings to an even word address.
				let odd = (v.length + 1 ) % 2; //Account for the trailing NULL sentinel.
				if (odd) seg.code += String.fromCharCode(0);
				//Number of 32-bit words 
				seg.counter += (v.length + 1 + odd) / 2;
			}	break;
			default: {
				console.error("BAD TOKEN", token);
			}
		}
	}
}
