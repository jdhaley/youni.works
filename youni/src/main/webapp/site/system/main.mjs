import boot			from "./package/boot.mjs";
import system		from "./package/system.mjs";
import compiler		from "./package/compiler.mjs";

import constructors	from "./conf/constructors.mjs";
import facets		from "./conf/facets.mjs";

let conf = {
	constructors: constructors,
	facets: facets,
	log: console,
	packages: {
		system: system,
		compiler: compiler,
		boot: boot
	}
}

export default function main() {
	return boot.Booter.boot(conf);
}
