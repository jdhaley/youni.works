import control		from "../base/package/control.mjs";
import client		from "../web/package/client.mjs";

import model		from "./package/model.mjs";
import parser		from "./package/parser.mjs";

//import grammar		from "./package/grammar.mjs";

import services		from "./conf/services.mjs";
import rules		from "./conf/test-rules.mjs";

//import rules		from "./conf/grammar-rules.mjs";
//import grammarSource from "./conf/grammar-source.mjs";

//import engine 		from "./conf/engine.mjs";

export default {
	packages: {
		control: control,
		platform: client,
		services: services,
		
		//Compiler...
		model: model,
		parser: parser,
		rules: rules,

//		grammar: grammar,		
//		grammarSource: grammarSource
	},
//	engine: engine
}