import {Request, Response} from "../response.js";

export default function rfs(res: Response) {
	let req: Request = res.req;
	let f = "./journal" + req.path;
	if (req.method == "GET") {
		if (!res.fs.existsSync(f)) {
			res.sendStatus(404)
		} else {
			let source = res.fs.readFileSync(f);
			res.type("text/plain");
			res.send(source);		
		}
	} else if (req.method == "PUT") {
		let dir = f.substring(0, f.lastIndexOf("/"));
		if (!res.fs.existsSync(dir)) {
			res.fs.mkdirSync(dir);
		}		
		res.fs.writeFileSync(f, req.body as any as string);
		res.sendStatus(200);
	}
}
