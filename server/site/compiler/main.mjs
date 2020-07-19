export default function main(sys, conf) {
	conf.engine(conf.window);
	conf.packages = sys.load(conf.packages);
	let fs = conf.packages.services.public.fs;
	fs.open("test-parser.txt", (message) => parserTest(sys, conf, message.content));
}
function parserTest(sys, conf, source) {
	source = conf.packages.model.Owner.create("source", source);
	console.debug(source.markup);
	
	let target =  conf.packages.model.Owner.create("target");
	let pipe = conf.packages.compiler.main;
	
	pipe.parse(source, 0, target);
	console.debug(target.markup);
}
