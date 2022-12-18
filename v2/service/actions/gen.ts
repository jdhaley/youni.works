import { TemplateGenerator } from "../../tpl/tpl.js";
import {Request, Response} from "../response.js";

export default function gen(res: Response) {
	let req: Request = res.req;

	let gen = new TemplateGenerator();
	let source = res.fs.readFileSync("./gen/source/" + req.query.source);
	let src = JSON.parse(source) as any[];
	for (let x of src) {
		gen.add(x.templates, x.argName, x.argType);
	}
	let out = gen.generateCode();
	res.fs.writeFileSync("./gen/target/" + req.query.target, out);
	res.sendStatus(200);
}
