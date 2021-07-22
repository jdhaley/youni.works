import fs from "fs";
export default function load(dir) {
    return function filer(req, res) {
        let path = dir + req.url.substring(req.url.indexOf("?") + 1);
        if (req.method == "GET") {
            let file;
            try {
                file = fs.readFileSync(path);
            } catch (error) {
            //	console.log("GET:", error);
                res.status(204);
                res.end();
                return;
            }
            if (req.url.endsWith(".css")) {
                res.writeHead(200, {"Content-Type": "text/css"});
                res.write(file);
                res.end();
            } else if (req.url.endsWith(".mjs")){
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.write(file);
                res.end();

            // } else if (req.url.endsWith(".png")) {
            // 	res.writeHead(200, {"Content-Type": "image/png"});
            // 	res.write(file);
            // 	res.end();
            } else {
                res.send(file);
            }
        } else if (req.method == "PUT") {
            let pathnameIdx = path.lastIndexOf("/");
            let dir = path.substring(0, pathnameIdx);
            pkg.fs.mkdir(dir, {
                recursive: true
            }, err => {
                if (err) throw err;
            });
            try {
                let stream = pkg.fs.createWriteStream(path);
                stream.on("error", err => console.log(err));
                req.pipe(stream);
            } catch (error) {
                if (error.code == "ENOENT") {
                    res.status(404);
                } else {
                    console.warn(error);
                    res.status(500);
                }
            }
        } else {
            res.status(400);
        }
        res.end();
    }
}