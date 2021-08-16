import fs from "fs";
const dir = Object.create(null);

export default function loader(path) {
    try {
        load(path, dir);
    } catch (err) {
        console.log(err);
    }
    return function loader(req, res) {
        let content = dir;
        content = JSON.stringify({
            ["folder$" + path]: content
        });
        res.set("Content-Type", "text/plain");
        res.send(content);
    }

    function load(path, dir) {
        if (!dir) dir = Object.create(null);

        dir[Symbol.for("dir")] = path;
        loaddir(dir, "./" + path);
        
        return dir;
    }

    function loaddir(dir, path) {
        for (let name of fs.readdirSync(path)) {
            loadFile(dir, path, name);
        }
    }

    async  function loadFile(dir, path, name) {
        const pathname = path + "/" + name;
        let file = fs.statSync(pathname);
        if (name.endsWith(".mjs")) {
            try {
                let o = await import(pathname);
                dir["pkg$" + name] = loadValue(o.default);
            } catch (err) {
                console.log(err);
                dir[name] = {
                    type$: "Error",
                    message: err.message
                }
            }
        } else if (file.isDirectory(pathname)) {
            name = "folder$" + name;
            dir[name] = Object.create(null);
            loaddir(dir[name], pathname);
        } else {
            dir["file$" + name] = null;
        }
    }
    function loadValue(source) {
        if (typeof source == "function") {
            return {
                type$: "Function",
                source: source.toString()
            }
        } else if (source && typeof source == "object") {
            let members = Object.create(null);
            for (let decl in source) {
                members[decl] = loadValue(source[decl]);
            }
            return members;    
        }
        return source;
    }
}