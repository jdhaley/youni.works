export default {
    type$: "/display",
    ItemHeader: {
        type$: "Display",
        facets: {
            folder: {
                icon: "/res/icons/folder-open.svg",
            },
            file: {
                icon: "/res/icons/file.svg",
            },
            pkg: {
                icon: "/res/icons/archive.svg",
            },
            interface: {
                icon: "/res/icons/gift.svg",
            },
            method: {
                icon: "/res/icons/settings.svg",
            },
            type: {
                icon: "/res/icons/link.svg",
            }
        },
        states: {
            "collapsed": "/res/icons/chevron-right.svg",
            "expanded": "/res/icons/chevron-bottom.svg",
            "empty": "/res/icons/empty.svg",
            "hidden": ""
        },
        virtual$state(value) {
            if (!arguments.length) return this.peer.$state;
            this.peer.$state = value;
            this.peer.firstChild.src = this.states[value];
        },
        view(model) {
            this.super(view, model);
            if (!model) {
                console.log(this.of.key);
            }
            let facet = this.facets[model.facet];
            let icon = facet ? facet.icon : "/res/icons/fullscreen.svg";
            let type = model.type;
            let value = "";
            switch (type) {
                case "function":
                case "object":
                    type = "";
                    break;
                case "number":
                    type = "";
                    value = model.expr;
                    icon = "/res/icons/fullscreen-exit.svg";
                    break;
                case "string":
                    type = "";
                    value = model.expr;
                    icon = "/res/icons/tag.svg";
                    break;
                case "boolean":
                    type = "";
                    value = model.expr ? true : false;
                    icon = "/res/icons/flag.svg";
                    break;
            }
            this.peer.innerHTML = `<img> <img src="${icon}" title="${model.facet}"> ${model.name} <i>${type}</i> <span>${value}</span>`;

            if (typeof model.expr == "object") {
                this.state = "collapsed";
            } else {
                this.state = "empty";
            }
        },
        extend$actions: {
            click(event) {
                event.value = this.model.expr;
                if (this.state === "collapsed") {
                    this.state = "expanded";
                } else if (this.state == "expanded") {
                    this.state = "collapsed";
                }
                event.subject = this.state;
            }
        }
    },
    ItemBody: {
        type$: "Collection",
        type$contentType: "Item",
        view(model) {
            if (this.peer.$show) {
                // let content = model;
                // if (content.expr && typeof content.expr == "object") content = model.expr;
                this.super(view, model.expr);
                this.owner.send(this, "view");
            } else {
                this.peer.$show = true;
            }
        }
    },
    Item: {
		type$: "Structure",
        members: {
            type$header: "ItemHeader",
            type$body: "ItemBody"
        },
		extend$actions: {
            empty(event) {
                event.subject = "showValue";
            },
			collapsed(event) {
                this.parts.body.style.display = "none";
                event.subject = "";
			},
			expanded(event) {
                if (!this.parts.body.peer.childNodes.length) {
                    this.parts.body.view(this.model);
                }
                this.parts.body.style.removeProperty("display");
                event.subject = "";
			}
		}
    }
}