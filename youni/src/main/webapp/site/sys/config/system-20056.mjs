import constructors	from "./constructors.mjs";
import facets		from "./facets.mjs";

import boot			from "../package/boot.mjs";
import system		from "../package/system.mjs";
import compiler		from "../package/compiler.mjs";

export default {
	constructors: constructors,
	facets: facets,
	log: console,
	packages: {
		system: system,
		compiler: compiler,
		boot: boot
	}
}