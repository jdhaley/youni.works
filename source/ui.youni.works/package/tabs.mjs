export default {
    type$: "/panel",
    Tabs: {
        type$: "Section",
        var$activeTab: null,
        members: {
            header: {
                type$: "Collection"
            },
            body: {
                type$: "Display"
            }
        },
        add(title, body) {
            if (!body) {
                body = this.owner.create("/display/Display");
                body.peer.textContent = title;
            }
            body.peer.$display = body.style.display;
            body.style.display = "none";
            let tab = this.owner.create("/tabs/Tab");
            tab.peer.innerText = title;
            tab.body = body;
            this.parts.header.append(tab);
            this.parts.body.append(body);
            return tab;
        },
        activate(tab) {
            if (this.activeTab) {
                this.activeTab.peer.classList.remove("activeTab");
                this.activeTab.body.style.display = "none";
            }
            this.activeTab = tab;
            this.activeTab.peer.classList.add("activeTab");
            this.activeTab.body.style.display = this.activeTab.body.peer.$display;
        },
        display() {
            this.super(display);
            let tree = this.add("Tree");
            this.add("Draw", this.owner.create("/pen/Canvas"));
            this.add("Note", this.owner.create("/note/Note"));
            let grid = this.owner.create({
                type$: "/display/Display",
                nodeName: "iframe",
                display() {
                    this.peer.src = "https://localhost/app/test/grid.html"
                }
            })
            this.draw(this.add("Grid (iframe)", grid));
            this.add("Other One");
            this.add("Other Two");
            this.add("Other Three");
            this.add("Other Four");
            this.add("Other 5");
            this.add("Other 6");
            this.add("Other 7");
            this.activate(tree);
        },
        draw(tab) {
       //     tab.body.peer.setAttribute("viewBox", "0 0 320 320");
        },
        extend$actions: {
            activateTab(event) {
                this.activate(event.tab);
            }
        }
    },
    Tab: {
        type$: ["Display", "/shape/Shape"],
        zones: {
            border: {
                right: 4
            },
            cursor: {
                "TR": "ew-resize",
                "CR": "ew-resize",
                "BR": "ew-resize",
            },
            subject: {
                "TR": "size",
                "CR": "size",
                "BR": "size",
            }
        },	
        var$body: null,
        extend$actions: {
            click(event) {
                event.subject = "activateTab";
                event.tab = this;
            },
            size(event) {
                if (event.track == this) {
                    let r = this.bounds;
                    this.bounds = {
                        width: event.clientX - r.left
                    }
                }
            }
        }
    }
}