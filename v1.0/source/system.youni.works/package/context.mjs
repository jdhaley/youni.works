let pkg = {
    Module: {
        type$: "/core/Component",
        name: "",
        version: "0.0",
        use: {
        },
        package: {
        }
    },
    Loader: {
        type$: "/factory/Factory",
        extend$conf: {
            type$componentType: "Module"
        },
        load(source) {
            let pkg = source.package;
            for (let name in source.use) {
                if (pkg[name]) console.error(`Package name "${name}" conflict with use "${name}"`);
                pkg[name] = source.use[name].package
            }

            let ctx = this.create(this);
            ctx._dir = source.package;
            ctx._owner = ctx.create(this.conf.componentType);

            ctx.extend(ctx._owner, source);
            ctx.extend(ctx._owner, {
                forName: function(name) {
                    return ctx.forName(name);
                },
                create: function (from) {
                    return ctx.create(from);
                },
                extend: function(object, from) {
                    return ctx.extend(object, from);
                },
                define: function (object, name, value, facet) {
                    return ctx.define(object, name, value, facet);
                }
            });
            console.log(ctx._owner);
            return ctx._owner;
        },
    }
}
export default pkg;