import signal		from "../base/package/signal.mjs";
import part			from "../base/package/part.mjs";
import parser		from "./package/parser.mjs";
import loader		from "./package/loader.mjs";

export default {
	packages: {
		signal: signal,
		part: part,
		parser: parser,
		loader: loader
	},
	test: part
}