
import fs from "fs";

export default function compileAll(sourceDir, targetDir) {
    let dir = fs.readdirSync(sourceDir);
    for (let name of dir) {
        if (!name.startsWith(".")) load(sourceDir, name).then(manifest => compile(targetDir, manifest));
    }   
}

async function load(sourceDir, name) {
    let index;
    try {
        index = (await import("./" + sourceDir + "/" + name + "/index.mjs")).default;
    } catch (err) {
        if (err.code == "ERR_MODULE_NOT_FOUND") {
            console.warn(`Directory "${name}" is missing index.mjs; skipping`);
            return;
        }
        console.error(err);
        return;
    }
    let module = index && index.module;
    if (!module) throw new Error(`Component "${name}" is missing module.mjs`);
    if (module.name && module.name != name) {
        log("Warning: module name doesn't match folder name. Using folder name");
    }
    module.name = name;
    module.package = Object.create(null);
    let dir = fs.readdirSync(sourceDir + "/" + module.name + "/package");
    for (let fname of dir) {
        let index = fname.lastIndexOf(".");
        let name = fname.substring(0, index);
        let ext = fname.substring(index + 1);
        if (ext == "mjs") {
            fname = "./" + sourceDir + "/" + module.name + "/package/" + fname;
            module.package[name] = (await import(fname)).default;    
        }
    }
    return index;
}

function compile(targetDir, manifest) {
    if (!manifest) return;
    let module = manifest.module;
    console.log("Compiling: " + module.name + "-" + module.version);
    let uses = module.use;
    let packages = module.package;
    delete module.use;
    delete module.package;

    let out = "";
    let use = "";
    for (let name in uses) {
        out += `import ${name} from ${JSON.stringify("./" + uses[name] + ".mjs")};\n`;
        use += "\t" + JSON.stringify(name) + ": " + name + ",\n";
    }
    out += "const module = " + compileValue(module) + ";\n";
    out += "module.use = {\n" + use + "};\n"
    out += "module.package = {";
    let pkg = "";
    for (let name in packages) {
        pkg += compilePackage(name, packages[name]);
        out += `\n\t${name}: ${name}(),`;
    }
    out += "\n};\n"
    out += "const conf = " + compileValue(manifest.conf) + ";\n";
    out += "const main = " + compileValue(manifest.main || loadModule) + ";\n";
    out += "export default main(module, conf);\n"
    out += pkg;

    fs.writeFileSync(targetDir + "/" + module.name + "-" + module.version + ".mjs", out);
}

let $context = "";
function compilePackage(name, pkg) {
    $context = "/" + name + "/";
    return `\nfunction ${name}() {\nconst pkg = ${compileValue(pkg)}\nreturn pkg;\n}\n`;
}

function compileValue(value, depth) {
    switch (typeof value) {
        case "undefined":
        case "boolean":
        case "number":
            return value;
        case "string":
            return JSON.stringify(value);
        case "function":
            let source = value.toString();
            if (source.startsWith("function(") || source.startsWith("function ") ) return source;
            if (source.startsWith("async ")) {
                source = source.substring("async ".length);
                return "async function " + source;
            }
            return "function " + source;
        case "object":
            if (!value) return "null";
            if (Object.getPrototypeOf(value) == Array.prototype) return compileArray(value, depth || 0);
            return compileObject(value, depth || 0);
    }
}
function compileArray(value, depth) {
    depth++;
    let out = "";
    for (let name in value) {
        out += compileValue(value[name], depth) + ", "
    }
    if (out.endsWith(", ")) out = out.substring(0, out.length - 2);
    return "[" + out + "]";
}
function compileObject(value, depth) {
    depth++;
    let out = "";
    for (let name in value) {
        out += compileProperty(name, value[name], depth);
    }
    if (out.endsWith(",")) out = out.substring(0, out.length - 1);
    return "{" + out + indent(depth - 1) + "}";
}
function compileProperty(key, value, depth) {
    if (value && facetOf(key) == "type" || key == "type$") {
        if (value && typeof value == "string" && !value.startsWith("/")) {
            value = $context + value;
        } else if (Object.getPrototypeOf(value) == Array.prototype) {
            for (let i = 0, len = value.length; i < len; i++) {
                let type = value[i];
                if (typeof type == "string" && !type.startsWith("/")) {
                    value[i] = $context + type;
                }
            }
        }
    }
    return keyValue(key, compileValue(value, depth), depth);   
}
function facetOf(key) {
    let index = key.indexOf("$");
    return index < 1 ? "" : key.substr(0, index);
}
function keyValue(key, value, depth) {
    return indent(depth) + JSON.stringify(key) + ": " +  value + ","; 
}
function indent(depth) {
    let out = "\n";
    for (let i = 0; i < depth; i++) out += "\t";
    return out;
}

//TODO this is dependent on naming system.youni.works "system".
function loadModule(module) {
    return module.use.system.load(module);
}