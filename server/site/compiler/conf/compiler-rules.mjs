import rule from "../util/ruleBuilder.mjs";
import token from "./token-rules.mjs";
import branch from "./branch-rules.mjs";
export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	token: token,
	branch: branch,
	main: rule.pipe(token.main, branch.main)
}
