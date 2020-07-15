import control		from "../base/package/control.mjs";
import client		from "../web/package/client.mjs";

import model		from "./package/model.mjs";
import parser		from "./package/parser.mjs";

//import grammar		from "./package/grammar.mjs";

import services		from "./conf/services.mjs";
import tokens		from "./conf/test-token-rules.mjs";
import match		from "./conf/test-match-rules.mjs";

//import rules		from "./conf/grammar-rules.mjs";
//import grammarSource from "./conf/grammar-source.mjs";

import engine 		from "./conf/engine.mjs";

export default {
	packages: {
		control: control,
		platform: client,
		services: services,
		client: client,
		
		//Compiler...
		model: model,
		parser: parser,
		tokens: tokens,
		match: match,

//		grammar: grammar,		
//		grammarSource: grammarSource
	},
	window: window,
	engine: engine
}