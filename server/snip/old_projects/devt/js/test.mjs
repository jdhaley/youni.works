import content	from "/sys/site/youni.works/package/content.mjs";
import parser	from "/sys/site/youni.works/package/parser.mjs";
import grammar	from "/sys/site/youni.works/package/grammar.mjs";
import rules	from "/sys/site/youni.works/package/grammar-rules.mjs";

import sourceSource	from "/sys/site/youni.works/config/source-source.mjs";
import compiler		from "/sys/site/youni.works/package/source-compiler.mjs";

import compilers	from "./js-compilers.mjs";
import test			from "./js-test.mjs";

export default function jstest() {
	let pkgs = this.load({
		content: content,
		parser: parser,
		rules: rules,
		grammar: grammar,
		compiler: compiler,
		compilers: compilers
	});	
	let rule = pkgs.grammar.GrammarCompiler.target(sourceSource).source;
	let view = rule.view(test);
	console.log(view.markup);
	let doc = new DOMParser().parseFromString(view.markup, "text/xml");
	console.info(doc);
	let controller = pkgs.compilers.Body;
	let node = controller.control(view);
	node.controller.compile(node);
	console.log(node.controller.target(node));
}