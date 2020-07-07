import content	from "/sys/site/youni.works/package/content.mjs";
import parser	from "/sys/site/youni.works/package/parser.mjs";
import grammar	from "/sys/site/youni.works/package/grammar.mjs";
import rules	from "/sys/site/youni.works/package/grammar-rules.mjs";

import grammarSource	from "/sys/site/youni.works/config/grammar-source.mjs";
import sourceSource		from "/sys/site/youni.works/config/source-source.mjs";

import test				from "./js-test.mjs";

window.ERROR = function(arg) {
	console.error(`Unknown element: ${arg}`);
}

export default function parseTest() {
	let pkgs = this.load({
		content: content,
		parser: parser,
		rules: rules,
		grammar: grammar
	});

	grammarTest(pkgs.grammar.GrammarCompiler);
	sourceTest(pkgs.grammar.GrammarCompiler);
}

function grammarTest(compiler) {
	let rule = compiler.target(grammarSource).grammar;
	console.log(rule);
	let view = rule.view(grammarSource);
	console.log(view.markup);
	compiler.logView(view);
}

function sourceTest(compiler) {
	let rule = compiler.target(sourceSource).package;
	console.log(rule);
	let view = rule.view(test);
	console.log(view.markup);
	compiler.logView(view);
	let object = compileValue(view);
	console.log(object);
	let fn = new Function("sys", "return (" + object + ")");
	console.log(fn);
	let compiled = fn(compiler.sys);
	console.log(compiled);
}

let depth = 0;
function indent(depth) {
	let out = "";
	for (let i = 0; i < depth; i++) out += "\t";
	return out;
}

const compilers = {
	string: (a) => a.text,
	number: (a) => a.text,
	word: (a) => a.text == "next" ? "" : a.text,
	op: (a) => a.text,
	pn: (a) => a.text,
	noval: (a) => "undefined",
	
	array: (a) => `[${compileList(a)}]`,
	seq: (a) => `(${compileList(a)})`,
	eval: compileValues,
	ele: compileValues,
	pair: function(pair) {
		let key = "";
		for (let ele of pair.at(0)) key += ele.text + "$";
		key = key.slice(0, key.length - 1);
		if (pair.at(1).name == "name" && key.indexOf("$") < 0) key = "type$" + key;
		return key + ": " + compileValue(pair.at(1));
	},
	name: function(name) {
		return `"${name.text}"`;
	},
	signature: function(type) {
		return `"${type.at(0).text}"` + (type.length > 1 ? compileValue(type.at(1)) : "");
	},
	type: function(type) {
		return `"${type.at(0).text}"` + (type.length > 1 ? compileValue(type.at(1)) : "");
	},
	fn: function(fn) {
		let seq = fn.at(0).name == "seq" ? fn.at(0) : "";
		let body = compileValue(fn.at(seq ? 1 : 0));
		if (seq) seq = compileValue(seq);
		return isMethodDecl(fn) ? `function${seq} ${body}` : `${seq} => ${body}`;
	},
	body: function(view) {
		let out = "{\n";
		depth++;
		for (let ele of view) {
			let decl = "";
			if (ele.name == "pair") {
				decl = "let " + ele.at(0).text + " = ";
				ele = ele.at(1);
			}
			out += indent(depth) + decl + (ele ? compileValue(ele) + ";\n" : "\n");
		}
		depth--;
		return out + indent(depth) + "}";
	},
	"if": compileKey,
	"else": compileKey,
	"while": compileKey,
	"for": compileKey,
	"switch": compileSwitch,
	"return": compileKey,
	paren: (a) => `(${compileValues(a)})`,
	object: compileObject,
	package: compileObject
}

let path = [];

function compileKey(value) {
	return value.name + " " + compileValues(value);
}

function isMethodDecl(fn) {
	let fpath = path.slice();
	fpath.pop();
	return  fpath.pop().name == "pair" && fpath.pop().name == "object";
}

let letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	+	"abcdefghijklmnopqrstuvwxyz"
	+	"$_"
	+	"0123456789";
function isLetter(char) {
	return letter.indexOf(char.charAt(0)) >= 0;
}

function compileValues(value) {
	let out = "";
	for (let ele of value) {
		ele = compileValue(ele);
		if (out && ele && isLetter(ele.charAt(0))) {
			if (isLetter(out.charAt(out.length - 1))) out += " ";
		}
		out += ele;
	}
	return out;
}
function compileList(value) {
	let out = "";
	let i = 0;
	for (let ele of value) {
		if (i++ > 0 || ele.name != "name") out += compileValue(ele) + ", ";
	}
	if (out.endsWith(", ")) out = out.slice(0, out.length - 2);
	return out;
}
function compileValue(ele) {
	path.push(ele);
	let compiler = compilers[ele.name];
	let out = compiler ? compiler(ele) : `ERROR("${ele.markup}")`;
	path.pop();
	return out;
}

function getIsaFacet(ele) {
	//pair -> object -> name
	let check = path.length > 2 ? path[path.length - 2] : null;
	return check && check.name == "pair" && check.at(0).name == "name"
		? "super"
		: "type";
}
function compileObject(view) {
	let out = "{\n";
	depth++;
	for (let ele of view) {
		switch (ele.name) {
			case "type":
				let facet = "typeOrSuper"; //getIsaFacet(ele);
				out += indent(depth) + facet + "$: \"" + ele.text + "\",\n";
				break;
			case "pair":
				out += indent(depth) + compileValue(ele) + ",\n";
				break;
			case "error":
				out += indent(depth) + "/*" + ele.markup + "*/\n";
				break;
		}
	}
	depth--;
	return out + indent(depth) + "}";
}

function compileSwitch(view) {
	let out = "switch " + compileValue(view.at(0)) + " {\n";
	depth++;
	for (let ele of view.at(1)) {
		if (ele.name == "pair") {
			out += indent(depth);
			if (ele.at(0).text != "default") out += "case ";
			out += compileValue(ele.at(0)) + ": ";
			ele = ele.at(1);
			if (ele) out += compileValue(ele) + ";\n";
			
//			if (ele.text.endsWith("next")) {
//				out += ";\n";
//			} else {
//				out += ";\n" + indent(depth + 1) + "break;\n";
//			}
		} else {
			console.error("not case");
		}
	}
	depth--;
	return out + indent(depth) + "}";
}