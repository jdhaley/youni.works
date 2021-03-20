import content	from "/sys/site/youni.works/package/content.mjs";
import parser	from "/sys/site/youni.works/package/parser.mjs";
import grammar	from "/sys/site/youni.works/package/grammar.mjs";
import rules	from "/sys/site/youni.works/package/grammar-rules.mjs";

import grammarSource	from "/sys/site/youni.works/config/grammar-source.mjs";

export default function parseTest() {
	let pkgs = this.load({
		content: content,
		parser: parser,
		rules: rules, //must be before grammar.
		grammar: grammar,
	});
	grammarTest(pkgs.grammar.GrammarCompiler);
}

function grammarTest(compiler) {
	let rule = compiler.target(grammarSource).grammar;
	console.log(rule);
	let view = rule.view(grammarSource);
	console.log(view.markup);
	compiler.logView(view);
}