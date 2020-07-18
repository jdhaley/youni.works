import model		from "../base/package/model.mjs";
import parser		from "../base/package/parser.mjs";

import control		from "../base/package/control.mjs";
import client		from "../web/package/client.mjs";

import services		from "./conf/services.mjs";
import tokens		from "./conf/token-rules.mjs";
import branches		from "./conf/branch-rules.mjs";
import compiler		from "./conf/compiler-rules.mjs";

import engine 		from "./conf/engine.mjs";

export default {
	packages: {
		control: control,
		platform: client,
		services: services,
		client: client,
		
		model: model,
		parser: parser,
		
		tokens: tokens,
		branches: branches,
		compiler: compiler
	},
	window: window,
	engine: engine
}