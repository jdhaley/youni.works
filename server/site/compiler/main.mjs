export default function main(sys, conf) {
	conf.engine(conf.window);
	conf.packages = sys.load(conf.packages);
	let fs = conf.packages.services.public.fs;
	fs.open("test-parser.txt", (message) => parserTest(sys, conf, message.content));
}
function parserTest(sys, conf, source) {
	source = conf.packages.parser.Production.createNode(source);
	let target =  conf.packages.parser.Production.createNode();
	
	let rule = conf.packages.rules.test;
	source.name = "source";
	console.log(source.markup);
	target.name = "target";
	rule.parse(source, 0, target);
	console.log(target.markup);
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