
// import fs from "fs";
// import system from "./target/system.youni.works-2.1.mjs";
export default function load(path) {
    const dir = Object.create(null);
    dir[Symbol.for("dir")] = path;
    loaddir(dir, "./" + path);
    
    return dir;
}

function loaddir(dir, path) {
    for (let name of fs.readdirSync(path)) {
        loadFile(dir, path, name);
    }
}

async function loadFile(dir, path, name) {
    const pathname = path + "/" + name;
    let file = fs.statSync(pathname);
    if (name.endsWith(".mjs")) {
        let o = await import(pathname);
        dir[name] = o.default;
    } else if (file.isDirectory(pathname)) {
        dir[name] = Object.create(null);
        dir[name][Symbol.for("dir")] = pathname;
        loaddir(dir[name], pathname);
    } else {
        dir[name] = null;
    }
}