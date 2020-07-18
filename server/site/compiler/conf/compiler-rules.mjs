import rule from "../util/ruleBuilder.mjs";
import token from "./token-rules.mjs";
import branch from "./branch-rules.mjs";
//import divvy from "./divvy-rules.mjs";
export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	token: token.main,
	branch: branch.main,
//	divvy: divvy.main,
	main: rule.pipe("token", "branch")
}
