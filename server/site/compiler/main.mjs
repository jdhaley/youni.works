export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	grammarTest(sys, conf);
}

function grammarTest(sys, conf) {
	let compiler = sys.extend(conf.packages.grammar.GrammarCompiler, {
		rule: conf.packages.rules.grammar
	});
	let content = conf.packages.grammarSource;
	let rule = compiler.target(content).grammar;
	console.log(rule);
	let view = rule.view(conf.packages.grammarSource);
	console.log(view.markup);
	compiler.logView(view);
}