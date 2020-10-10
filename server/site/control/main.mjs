export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	
	const owner = sys.extend(pkg.control.Owner, {
		document: document,
		types: pkg.types
	});
	let app = owner.create("app", {
		view: document.body
	});
	app.append(owner.create("input", {
		name: "surname"
	}));
}