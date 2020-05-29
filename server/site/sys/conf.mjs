import system		from "../base/package/system.mjs";
import compiler		from "./package/compiler.mjs";
import boot			from "./package/boot.mjs";

import constructors	from "./conf/constructors.mjs";
import facets		from "./conf/facets.mjs";

export default {
	packages: {
		system: system,
		compiler: compiler,
		boot: boot
	},
	constructors: constructors,
	facets: facets,
	log: console
}

