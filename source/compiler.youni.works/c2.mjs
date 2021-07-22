
export default function compile(source, targetDir) {
    for (let name in source) {
        compileModule(source[name], target);
    }   
}

async function compileModule(source, target) {
    let module = source["module.mjs"];
    module.package = source.package;
    // if (module.name && module.name != name) {
    //     log("Warning: module name doesn't match folder name. Using folder name");
    // }
    // module.name = name;
    // module.package = Object.create(null);
    return index;

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
        out += `import ${name} from ${JSON.stringify("/target/" + uses[name] + ".mjs")};\n`;
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
}