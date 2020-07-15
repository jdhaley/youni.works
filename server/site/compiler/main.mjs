export default function main(sys, conf) {
	conf.engine(conf.window);
	conf.packages = sys.load(conf.packages);
	let fs = conf.packages.services.public.fs;
	fs.open("test-parser.txt", (message) => parserTest(sys, conf, message.content));
}
function parserTest(sys, conf, source) {
	source = conf.packages.parser.Production.createNode(source);
	source.name = "source";
	let target =  conf.packages.parser.Production.createNode();
	target.name = "tokens";
	
	let rule = conf.packages.tokens.main;
	console.log(source.markup);
	rule.parse(source, 0, target);
	console.log(target.markup);
	console.log(target);

	source = target;
	target =  conf.packages.parser.Production.createNode();
	target.name = "target";	
	rule = conf.packages.match.main;
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