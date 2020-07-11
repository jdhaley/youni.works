export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	parserTest(sys, conf);
	//grammarTest(sys, conf);
}
function parserTest(sys, conf) {
	let rule = conf.packages.rules.test;
	let source = conf.packages.parser.Production.createNode("it was. the best.");
	let target = rule.createNode();
	rule.parse(source, 0, target);
	console.log(target);
}
//function grammarTest(sys, conf) {
//	let compiler = sys.extend(conf.packages.grammar.GrammarCompiler, {
//		rule: conf.packages.rules.grammar
//	});
//	let content = conf.packages.grammarSource;
//	let rule = compiler.target(content).grammar;
//	console.log(rule);
//	let view = rule.view(conf.packages.grammarSource);
//	console.log(view.markup);
//	compiler.logView(view);
//}