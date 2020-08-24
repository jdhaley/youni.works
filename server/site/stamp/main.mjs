export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
//	let pages = pkg.test.pages;
//	for (let page of pages) page.draw(document.body);
	let input = pkg.input.Varieties;
	let shape = pkg.control.Shape;
	let shapes = pkg.shapes;
	for (let issue of pkg.model) {
		document.body.append(issue.title);
		let group = pkg.control.Control.append(document.body, "div", {
			class: "group"
		});
		for (let variety of issue.varieties) {
			let design = shapes[variety["design"]];
			let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
			let data = (variety.denom || "") + "\n" + (variety.colors || "") + "\n" + (variety.subject || "");
			if (design) shape.draw(group, {
				value: variety,
				width: design.width,
				height: design.height,
				image: image,
				data: data
			});
		}
		input.draw(document.body, issue.varieties);
	}
}

function oldmain(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	let ctx = sys.extend(pkg.layout.Context, {
		x: 0,
		y: 0,
		width: 216,
		height: 280,
		container: document.body
	});
	ctx.container = ctx.append("svg", {
		width: "216mm",
		height: "280mm",
		viewBox: "0 0 216 280",
		preserveAspectRatio: "xMinYMin slice"
	});
	ctx.container.innerHTML = `
			    <style>
					SVG {
						background: linen;
					}
				    TEXT {
						font-size: 1mm;
						font-weight: bold;
						fill: black;
						stroke: white;
						stroke-width: .05mm;
						stroke-opacity: .6;
					}
					PATH {
						stroke-width: .25;
						stroke: black;
						fill: none;
					}
				</style>
		`
	let set = pkg.test.set;
	set.draw(ctx);
}
