export default function main(sys, conf) {
	let pkg = sys.load(conf.packages);
	
	document.owner = sys.extend(pkg.control.Owner, {
		document: document,
		types: pkg.types
	});
	let control = document.owner.create("input", {
		name: "surname"
	});
	document.body.append(control.view);
}