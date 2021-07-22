export default {
    type$: "/system/core",
    Member: {
        // declaredBy: object,
        facet: "",
        name: "",
        type: "",
        expr: null,
        configurable: true,
        enumerable: true
    },
    Converter: {
        type$util: "/base/util",
        facetOf(decl) {
            if (typeof decl == "symbol") return "";
            decl = "" + decl;
            let index = decl.indexOf("$");
            return index < 0 ? "" : decl.substr(0, index);
        },
        nameOf(decl) {
            if (typeof decl == "symbol") return decl;
            decl = "" + decl;
            let index = decl.indexOf("$");
            return index < 0 ? decl : decl.substring(index + 1);
        },
        processMember(member) {
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
        memberFor(key, value) {
            let member = Object.create(null);
            member.facet = this.facetOf(key);
            member.name = this.nameOf(key);
            member.type = typeof value;
            member.expr = value;
            return member;
        },
        membersFor(source) {
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
        convert(value) {
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
        },
    }
}
