import signal		from "../base/package/signal.mjs";
import part			from "../base/package/part.mjs";
import member		from "./package/member.mjs";

export default {
	packages: {
		signal: signal,
		part: part,
		member: member,
	},
	test: member,
}