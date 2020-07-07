export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	grammarTest(conf);
}

function grammarTest(conf) {
	let compiler = conf.packages.grammar.GrammarCompiler;
	let rule = compiler.target(conf.packages.grammarSource).grammar;
	console.log(rule);
	let view = rule.view(conf.packages.grammarSource);
	console.log(view.markup);
	compiler.logView(view);
}