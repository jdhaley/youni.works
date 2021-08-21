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
                body = this.owner.create("/ui/display/Display");
                body.peer.textContent = title;
            }
            body.peer.$display = body.style.display;
            body.style.display = "none";
            let tab = this.owner.create("/ui/tabs/Tab");
            tab.peer.innerText = title;
            tab.body = body;
            this.parts.header.append(tab);
            this.parts.body.append(body);
            return tab;
        },
        activate(tab) {
            if (tab == this.activeTab) return;
            if (this.activeTab) {
                this.activeTab.peer.classList.remove("activeTab");
                this.activeTab.body.style.display = "none";
            }
            this.activeTab = tab;
            this.activeTab.peer.classList.add("activeTab");
            this.activeTab.body.style.display = this.activeTab.body.peer.$display;
        },
        draw(tab) {
       //     tab.body.peer.setAttribute("viewBox", "0 0 320 320");
        },
        extend$actions: {
            activateTab(event) {
                this.activate(event.tab);
                event.subject = "";
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