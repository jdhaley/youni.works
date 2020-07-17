export default function main(sys, conf) {
	conf.engine(conf.window);
	conf.packages = sys.load(conf.packages);
	let fs = conf.packages.services.public.fs;
	fs.open("test-parser.txt", (message) => parserTest(sys, conf, message.content));
}
function parserTest(sys, conf, source) {
	source = conf.packages.model.Owner.create("source", source);
	let target =  conf.packages.model.Owner.create("tokens");
	
	let rule = conf.packages.tokens.main;
	console.log(source.markup);
	rule.parse(source, 0, target);
	console.debug(target.markup);

	source = target;
	target =  conf.packages.model.Owner.create("target");
	rule = conf.packages.branches.main;
	rule.parse(source, 0, target);
	console.debug(target.markup);
}
