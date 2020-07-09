import control		from "../base/package/control.mjs";
import client		from "../web/package/client.mjs";

import parser		from "./package/parser.mjs";
import grammar		from "./package/grammar.mjs";

import services		from "./conf/services.mjs";

import rules		from "./conf/grammar-rules.mjs";
import grammarSource from "./conf/grammar-source.mjs";

export default {
	packages: {
		control: control,
		platform: client,
		services: services,
		
		//Compiler...
		parser: parser,
		grammar: grammar,
		
		rules: rules,
		grammarSource: grammarSource
	},
}