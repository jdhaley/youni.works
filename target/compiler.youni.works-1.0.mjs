import system from "./system.youni.works-2.1.mjs";
const module = {
	"name": "compiler.youni.works",
	"version": "1.0",
	"moduleType": "library"
};
module.use = {
	system: system
}
module.package = {
	_devt: _devt(),
	compiler: compiler(),
	converter: converter(),
	loader: loader(),
	transcoder: transcoder()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function _devt() {
	const pkg = {
	"Member": {
		"facet": "",
		"name": "",
		"type": "",
		"expr": null,
		"configurable": true,
		"enumerable": true
	},
	"FileNode": {
		"name": "",
		"created": 0,
		"modified": 0,
		"size": 0,
		"contentType": "",
		"var$content": undefined,
		"once$to": function once$to() {
			if (typeof this.content == "object") {
				return this[Symbol.for("owner")].create({
					symbol$iterator: function*() {
						for (let name in this.content) {
							return this.content[name];
						}
					}
				});
			}
		},
		"loadContent": function loadContent() {
		},
		"extend$actions": {
			"contentLoaded": function contentLoaded(event) {
				this.content = event.content;
			}
		}
	}
}
return pkg;
}

function compiler() {
	const pkg = {
	"type$": "/loader",
	"type$Transcoder": "/transcoder/Transcoder",
	"ModuleLoader": {
		"type$": "/compiler/Instance",
		"type$loader": "/compiler/Loader",
		"fs": null,
		"context": "",
		"load": function load(sourceDir) {
			let context = this.fs.realpathSync(this.context)
			console.log(this.context, context);
			let loader = this.loader.extend({
				context: context,
				fs: this.fs
			});
			loader.load(context, sourceDir).then(node => this.loadModules(node));
		},
		"loadModules": function loadModules(node) {
			console.log(node.content);
			for (let name in node.content) {
				let module = this.loadModule(node.content[name]);
				if (module) this.target(module);
			}
		},
		"loadModule": function loadModule(folder) {
			let module = folder.content["module.mjs"];
			module = module && module.content || null;
			if (!module) {
				console.log("no module.mjs, skipping");
				return;
			}
			if (module.name && module.name != folder.name) {
				console.log(`Warning: module.name "${module.name}" doesn't match folder name "${folder.name}". Using "${folder.name}"`);
			}
			module.name = folder.name;
			module.package = Object.create(null);
			let pkgs = folder.content.package;
			if (pkgs) for (let name in pkgs.content) {
				let pkg = pkgs.content[name];
				if (name.endsWith(".mjs")) {
					name = name.substring(0, name.lastIndexOf(".mjs"));
				}
				module.package[name] = pkg.content;
			}
			let conf = folder.content["conf.mjs"];
			if (conf) module.conf = conf.content;
			let main = folder.content["main.mjs"];
			if (main) module.main = main.content;
try {
	let context = this.fs.realpathSync(this.context)
	this.copy(context + "/source/" + module.name + "/static", context + "/target/" + module.name + "-" + (module.version || "0.0"));
} catch (err) {
	console.log(err);
}
			return module;
		},
		"copy": function copy(src, dest) {
			let isDir;
			try {
				isDir = this.fs.statSync(src).isDirectory();
			} catch (err) {
				return;
			}
			if (isDir) {
				this.fs.mkdirSync(dest, {
					recursive: true
				});
				for (let name of this.fs.readdirSync(src)) {
					this.copy(src + "/" + name, dest + "/" + name);
				}	
			} else {
				this.fs.copyFileSync(src, dest);
			}
		},
		"target": function target(module) {
			console.log(module);
		}
	},
	"ModuleCompiler": {
		"type$": ["/compiler/ModuleLoader", "/compiler/Transcoder"],
		"var$pkgContext": "",
		"targetDir": "/tmp/target.youni.works",
		"target": function target(module) {
			console.log("Compiling: " + module.name + "-" + module.version);
			let imports = this.compileImports(module.use);
			let use = this.compileUse(module.use);
			let pkg = this.compilePackage(module.package);
			let pkgs = this.compilePackages(module.package);
			let init = this.compileInit(module);
			let mod = this.compileModule(module);
			
			let out = imports + mod + use + pkg + init + pkgs;
			this.fs.writeFile(`${this.context}/target/${module.name}-${module.version || "0.0"}.mjs`, out, () => null);
		},
		"compileImports": function compileImports(use) {
			let out = "";
			if (use) for (let name in use) {
				let ref = JSON.stringify("./" + use[name] + ".mjs");
				out += `import ${name} from ${ref};\n`;
			}
			return out;
		},
		"compileUse": function compileUse(use) {
			let out = "module.use = {";
			if (use) for (let name in use) {
				out += `\n\t${name}: ${name},`;
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return out + "\n}\n";
		},
		"compilePackage": function compilePackage(pkg) {
			let out = "module.package = {";
			for (let name in pkg) {
				out += `\n\t${name}: ${name}(),`;
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return out + "\n}\n";
		},
		"compilePackages": function compilePackages(pkg) {
			let out = "";
			for (let name in pkg) {
				this.pkgContext = "/" + name + "/";
				let body = `\tconst pkg = ${this.transcode(pkg[name])}\nreturn pkg;`;
				out += `function ${name}() {\n${body}\n}\n\n`;
			}
			return out;
		},
		"compileInit": function compileInit(module) {
			let conf = module.conf;
			let main = module.main || this.main_loadModule;
			let out = `const conf = ${this.transcode(conf)};\n`;
			out += `const main = ${this.transcode(main)};\n`;
			out += `export default main(module, conf);\n`;
			return out;
		},
		"compileModule": function compileModule(module) {
			delete module.use;
			delete module.package;
			delete module.conf;
			delete module.main;
			return `const module = ${this.transcode(module)};\n`;
		},
		"main_loadModule": function main_loadModule(module) {
			return module.use.system.load(module);
		}
	}
}
return pkg;
}

function converter() {
	const pkg = {
	"type$": "/system/core",
	"Converter": {
		"type$util": "/base/util",
		"facetOf": function facetOf(decl) {
            if (typeof decl == "symbol") return "";
            decl = "" + decl;
            let index = decl.indexOf("$");
            return index < 0 ? "" : decl.substr(0, index);
        },
		"nameOf": function nameOf(decl) {
            if (typeof decl == "symbol") return decl;
            decl = "" + decl;
            let index = decl.indexOf("$");
            return index < 0 ? decl : decl.substring(index + 1);
        },
		"processMember": function processMember(member) {
            if (member.expr === null) member.type = "any";
            if (member.expr === undefined) member.type = "void";

            if (member.type == "object") {    
                if (member.expr.type$ == "Function") {
                    member.type = "function";
                    if (!member.facet) member.facet = "method";
                    member.expr = member.expr.source.replace(/\t/g, "\u00B7");
                } else {
                    if (member.expr.type$) {
                        member.type = member.expr.type$;
                        if (typeof member.type != "string") {
                            let type = "";
                            for (let i in member.type) type += member.type[i] + " & ";
                            member.type = type.substring(0, type.length - 3);
                        }
                    }    
                    member.expr = this.convert(member.expr);
                }
            }
            if (this.util.Text.isUpperCase(member.name.charAt(0)) && !member.facet) {
                member.facet = "interface";
            }
            if (member.facet == "type") {
                member.type = member.expr;
                member.expr = null;
            }
        },
		"memberFor": function memberFor(key, value) {
            let member = Object.create(null);
            member.facet = this.facetOf(key);
            member.name = this.nameOf(key);
            member.type = typeof value;
            member.expr = value;
            return member;
        },
		"membersFor": function membersFor(source) {
            let members = Object.create(null);
            for (let decl in source) {
                let member = this.memberFor(decl, source[decl]);
                // member.members = members;
                if (member.name) {
                    this.processMember(member);
                    members[member.name] = member;
                }
            }
            return members;
        },
		"convert": function convert(value) {
            if (value && typeof value == "object") {
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; i++) {
                        value[i] = this.convert(value[i]);
                    }
                } else {
                    value = this.membersFor(value);
                }
            }
            return value;
        }
	}
}
return pkg;
}

function loader() {
	const pkg = {
	"type$": "/system/core",
	"Loader": {
		"type$": "/loader/Instance",
		"fs": null,
		"status": function status(pathname) {
			return this.fs.statSync(pathname);
		},
		"entries": function entries(pathname) {
			return this.fs.readdirSync(pathname)
		},
		"load": async function load(path, name) {
			path += "/" + name;
			try {
				let stats = this.status(path);
				let node;
				if (stats.isDirectory()) {
					node = await this.loadFolder(path, name, stats);
				} else if (stats.isFile()) {
					node = await this.loadFile(path, name, stats);
				}
				return node;	
			} catch (e) {
				return this.newNode("error", name, e);
			}
		},
		"loadFolder": async function loadFolder(pathname, name, stats) {
			let folder = this.newNode("folder", name, stats);
			folder.mediaType = "folder";
			folder.content = Object.create(null);
			for (let name of this.entries(pathname)) {
				if (!name.startsWith(".")) {
					folder.content[name] = await this.load(pathname, name);
				}
			}
			return folder;
		},
		"loadFile": async function loadFile(pathname, name, stats) {
			let mediaType = this.getMediaType(pathname) || "file";

			let file = this.newNode("file", name, stats);
			if (mediaType) {
				file.mediaType = mediaType;
				let loader = this.contentLoaders[mediaType](pathname);
				file.content = await loader();
			}
			return file;
		},
		"getMediaType": function getMediaType(pathname) {
			let name = pathname.substring(pathname.lastIndexOf("/") + 1);
			let index = name.lastIndexOf(".") + 1;
			if (index) {
				let ext = name.substring(index);
				return this.fileTypes[ext];
			}
		},
		"newNode": function newNode(type, name, data) {
			let node = {
				type: type,
				name: name,
			}
			if (type == "error") {
				node.error = {
					message: data.message,
					code: data.code
				}
			} else {
				node.stats = {
					created: data.birthtimeMs,
					modified: data.mtimeMs,
					size: data.size	
				}
			}
			return node;
		},
		"fileTypes": {
			"mjs": "text/javascript"
		},
		"contentLoaders": {
			"text/javascript": function(pathname) {
				return async function importJs() {
					let content = await import(pathname);
					return content.default;
				}
			}
		}
	}
}
return pkg;
}

function transcoder() {
	const pkg = {
	"Transcoder": {
		"pkgContext": "",
		"isReference": function isReference(key) {
			return this.facetOf(key) == "type" || key == "type$";
		},
		"transcode": function transcode(value, depth) {
			if (!depth) depth = 0;
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
					if (Object.getPrototypeOf(value) == Array.prototype) return this.compileArray(value, depth);
					return this.compileObject(value, depth);
			}
		},
		"compileArray": function compileArray(value, depth) {
			depth++;
			let out = "";
			for (let name in value) {
				out += this.transcode(value[name], depth) + ", "
			}
			if (out.endsWith(", ")) out = out.substring(0, out.length - 2);
			return "[" + out + "]";
		},
		"compileObject": function compileObject(value, depth) {
			depth++;
			let out = "";
			for (let name in value) {
				out += this.compileProperty(name, value[name], depth);
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return "{" + out + this.indent(depth - 1) + "}";
		},
		"compileProperty": function compileProperty(key, value, depth) {
			if (this.isReference(key)) {
				value = this.compileReference(value);
			}
			value = this.transcode(value, depth);
			return this.indent(depth) + JSON.stringify(key) + ": " +  value + ",";
		},
		"compileReference": function compileReference(value) {
			if (!this.pkgContext) return value;
			if (typeof value == "string" && !value.startsWith("/")) {
				value = this.pkgContext + value;
			} else if (value && Object.getPrototypeOf(value) == Array.prototype) {
				for (let i = 0, len = value.length; i < len; i++) {
					let type = value[i];
					if (typeof type == "string" && !type.startsWith("/")) {
						value[i] = this.pkgContext + type;
					}
				}
			}
			return value;
		},
		"facetOf": function facetOf(key) {
			let index = key.indexOf("$");
			return index < 1 ? "" : key.substr(0, index);
		},
		"indent": function indent(depth) {
			let out = "\n";
			for (let i = 0; i < depth; i++) out += "\t";
			return out;
		}
	}
}
return pkg;
}

