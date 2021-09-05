export default {
    type$: "/panel",
    Stack: {
        type$: "Section",
        extend$conf: {
            indexType: "/ui/tabs/Tab",
            viewType: "/ui/display/Display",
            icon: "/res/icons/bag.svg"
        },
        var$activeTab: null,
        members: {
            header: {
                type$: "Display"
            },
            body: {
                type$: "Display"
            }
        },
        add(conf, body) {
            if (!body) {
                body = conf.body || this.conf.viewType;
                body = this.owner.create(body);
                //body.peer.textContent = conf.title;
            }
            body.peer.$display = body.style.display;
            body.style.display = "none";
            let tab = this.owner.create(this.conf.indexType);
            let icon = conf.icon || this.conf.icon;
            let title = conf.title;
            tab.peer.innerHTML = `<img src=${icon}><span>${title}</span>`;
            tab.body = body;
            this.at("header").append(tab);
            this.at("body").append(body);
            return tab;
        },
        activate(tab) {
            if (tab === undefined) {
                for (let first of this.at("header").to) {
                    tab = first;
                    break;
                }
            }
            if (!tab || tab == this.activeTab) return;
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
        view(views) {
            this.super(view);
            if (views) for (let key in views) this.add(views[key]);
            this.activate();
        },
        extend$actions: {
            activateTab(event) {
                this.activate(event.tab);
                event.subject = "";
            },
            collapse(event) {
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