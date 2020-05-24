import signal		from "../base/package/signal.mjs";
import part			from "../base/package/part.mjs";
import member		from "./package/member.mjs";

import services		from "./conf/services.mjs";
import test			from "./test.mjs";
export default {
	packages: {
		signal: signal,
		part: part,
		member: member,
		
		services: services
	},
	test: test
}