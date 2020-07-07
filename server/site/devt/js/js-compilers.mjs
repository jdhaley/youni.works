const LETTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	+	"abcdefghijklmnopqrstuvwxyz"
	+	"$_"
	+	"0123456789";

export default {
	package$:  "youniworks.com/source/c/compilers",
	package$compiler: "youniworks.com/source/compiler",
	BaseCompiler: {
		super$: "compiler.Compiler",
		compilers: {
			type$unknown: "BaseCompiler",
			type$object: "Record",
			type$array: "Array",
			type$seq: "Seq",
			type$eval: "Evaluation",
			type$string: "Token",
			type$number: "Token",
			type$word: "Token",
			type$name: "Token",
			type$noval: "Token",

			// Functions only:
			type$fn: "Function",
			type$fn_signature: "Scope",
			type$fn_body: "Body",
			
			type$tuple: "Seq",
			type$body: "Body",
			type$catch: "Body",
			type$finally: "Body",
			type$label: "Label",
			type$empty: "Token"
		},
		compile: function(part) {
			part.notice(`Unknown source element "${part.source.name}"`);
		}
	},
	Token: {
		super$: "BaseCompiler",
		compile: function(part) {
		},
		target: function(part) {
			switch (part.source.name) {
				case "noval":
					return "undefined";
				case "empty":
					return "";
			}
			return part.source.text;
		}
	},
	Branch: {
		super$: "BaseCompiler",
		compile: function(node) {
			this.load(node);
			this.compileParts(node);
		},
		compileParts: function(node) {
			if (node.parts) for (let part of node.parts) {
				part.controller.compile(part);
			}
		},
		load: function(node) {
			for (let source of node.source) {
				this.loadSource(source, node);
			}
		},
		loadSource: function(source, node) {
			this.controlSource(source, node);
		},
		target: function(node) {
			let out = this.startTarget(node);
			if (node.parts) for (let part of node.parts) {
				out = this.targetPart(part, out);
			}
			return this.endTarget(node, out);
		},
		targetPart: function(part, out) {
			let text = part.controller.target(part);
			if (out && text && this.isLetter(text.charAt(0))) {
				if (this.isLetter(out.charAt(out.length - 1))) out += " ";
			}
			return out + text;
		},
		startTarget: function(node) {
			return "";
		},
		endTarget: function(node, out) {
			return out;
		},
		isLetter: function(char) {
			return LETTER.indexOf(char.charAt(0)) >= 0;
		}
	},
	Scope: {
		super$: "Branch",
		loadSource: function(source, node) {
			switch (source.name) {
				case "type":
					this.loadType(source, node);
					break;
				case "pair":
					this.loadDecl(source, node);
					break;
				default:
					this.loadStatement(source, node);
					break;
			}
		},
		loadStatement: function(source, node) {
			this.controlSource(source, node);
		},
		loadType: function(type, node) {
			node.type = type;
		},
		loadDecl: function(pair, scope) {
			let name = this.parseName(pair.at(0));
			let facet = this.parseFacet(pair.at(0));
			
			let existing = scope.get(name.text);
			let part = this.controlSource(pair.at(1), scope);
			part.name = name.text;
			if (facet)  part.facet = facet.text;

			if (existing && existing.scope == scope) {
				part.notice(`Duplicate name. Replacing existing.`, existing);
			}
			return part;
		},
		parseName: function(decl) {
			return decl.name == "eval" ? decl.at(decl.length - 1) : decl;
		},
		parseFacet: function(decl) {
			return decl.name == "eval" ? decl.at(0) : null;
		},
		targetDecl: function(part) {
			return (part.facet ? part.facet + "$" : "") + part.name + ": ";
		}
	},
	Evaluation: {
		super$: "Branch",
	},
	Array: {
		super$: "Branch",
		targetPart: function(part, out) {
			return out + part.controller.target(part) + ", ";
		},
		startTarget: function(node) {
			return "[";
		},
		endTarget: function(node, out) {
			if (out.endsWith(", ")) {
				out = out.slice(0, out.length - 2);
			}
			return out + "]";
		}
	},
	Seq: {
		super$: "Branch",
		targetPart: function(part, out) {
			return out + part.controller.target(part) + ", ";
		},
		startTarget: function(node) {
			return "(";
		},
		endTarget: function(node, out) {
			if (out.endsWith(", ")) {
				out = out.slice(0, out.length - 2);
			}
			return out + ")";
		}
	},
	Record: {
		super$: "Scope",
		loadStatement: function(source, node) {
			node.notice("Invalid source", source);
		},
		targetPart: function(part, out) {
			out += this.indent(part.depth);
			if (part.name) out += this.targetDecl(part);
			out += part.controller.target(part);
			out += ",\n";
			return out;
		},
		startTarget: function(node) {
			let out = "{\n";
			if (node.type) {
				out += this.indent(node.depth + 1);
				out += this.targetType(node);
				out += ",\n";
			}
			return out;
		},
		endTarget: function(node, out) {
			if (out.endsWith(",\n")) {
				out = out.slice(0, out.length - 2);
				out += "\n";
			}
			return out + this.indent(node.depth) + "}";
		},
		targetType: function(part) {
			let str = "";
			for (let ele of part.type) str += ele.text + " ";
			if (str.endsWith(" ")) str = str.slice(0, str.length - 1);
			return (part.isType ? "super$" : "type$") + `: "${str}"`;
		}
	},
	Body: {
		super$: "Scope",
//		load: function(node) {
//			for (let source of node.source) {
//				if (source.name == "ele") {
//					scope.notice("Unterminated Statement", source);
//					source = source.at(0);
//				}
//				switch (source.name) {
//					case "pair":
//						this.loadDecl(source, node);
//						break;
//					case "empty":
//					default:
//						this.loadPart(source, node);
//						break;
//				}
//			}
//		},
	},
	Function: {
		super$: "BaseCompiler",
		compile: function(node) {
			if (node.source.at(0).name == "seq") {
				this.compileFunction(node);
			} else {
				this.compileBlock(node, source.at(0));
			}
		},
		compileFunction: function(node) {
			node.aspect = node.scope.controller == this.compilers.object ? "method" : "function";
			let sig = this.compilers.fn_signature.control(node.source.at(0), node);
			sig.controller.compile(sig);
			let body = this.compilers.fn_body.control(node.source.at(1), sig);
			body.controller.compile(body);
			node.content = sig;
		},
		compileBlock: function(node) {
			node.aspect = "block";
			let body = this.compilers.fn_body.control(node.source.at(0), sig);
			body.controller.compile(body);
			node.content = body;			
		},
		target: function(node, out) {
			return out + node.content.controller.target(node.content);
		}
	},
	Label: {
		super$: "BaseCompiler",
	},
}

//compileSignature: function(node, type) {
//let product = type.length && type.at(0).name == "name" ? type.at(0).text : "";
//let params = type.at(product ? 1 : 0);
//if (product && !node.get(product)) node.notice(`Function return type "${product}" not in scope.`);
//node.product = product;
//node.parameters = this.sys.extend(null);
//params && hoistParameters(node, params);
//},
//compileBody: function(node, body) {
////label:			([eval value]? ":"#br),
////tuple:			("("#div content ")"#div),
////ele:			expr, /* unterminated statement */
////empty:			";"#br,
////
//this.load(body, node);
//},
//load: function(src, node) {
//for (let source of src) {
//	if (source.name == "ele") {
//		scope.notice("Unterminated Statement", source);
//		source = source.at(0);
//	}
//	if (source.name == "pair")  {
//		this.loadDecl(source, node);
//	}
//	this.controlSource(source, node);
//}
//},
//target: function(node) {
//let out = "(";
//for (let name in node.parameters) {
//	out += name;
//	let type = node.parameters[name];
//	if (type) out += " /*" + type + "*/";
//	out += ", ";
//}
//if (out.endsWith(", ")) out = out.slice(0, out.length - 2);
//out += ")";
//out = (node.aspect == "method" ? "function" + out : out + " =>");
//out += " {\n";
//if (node.parts) for (let part of node.parts) {
//	out += this.indent(part.depth);
//	out += part.controller.target(part);
//	out += ";\n";
//}
//out += this.indent(node.depth) + "}";
//return out;
//}
//
//function hoistParameters(node, params) {
//	for (let param of params) {
//		switch (param.name) {
//			case "pair":
//				if (param.at(0).name != "word") node.notice("Invalid paramter name.");
//				let name = param.at(0).text;
//				let type = param.at(1).text;
//				if (!node.get(type)) {
//					node.notice(`Parameter "${name}" type "${type}" not in scope.`)
//				}
//				node.parameters[name] = type;
//				break;
//			case "word":
//				node.parameters[param.text] = "";
//				break;
//			default:
//				node.notice("Invalid parameter specification.");
//				break;
//		}
//	}
//}