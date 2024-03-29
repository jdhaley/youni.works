export default {
    type$: "/agent",
    Tabs: {
        type$: "Display",
        extend$conf: {
            tabType: "/ui/tabs/Tab",
            viewType: "/ui/agent/Display",
            icon: "/res/icons/bag.svg"
        },
        var$activeTab: null,
        members: {
            type$header: "Display",
            type$body: "Display"
        },
        add(conf, body) {
            if (!body) {
                body = conf.body || this.conf.viewType;
                body = this.owner.create(body);
                //body.peer.textContent = conf.title;
            }
            body.peer.$display = body.style.display;
            body.style.display = "none";
            let tab = this.owner.create(this.conf.tabType);
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
                this.activeTab.styles.remove("activeTab");
                this.activeTab.body.style.display = "none";
            }
            this.activeTab = tab;
            this.activeTab.styles.add("activeTab");
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
        extend$controller: {
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
        type$: ["Display", "Shape", "Columnar"],
        var$body: null,
        extend$controller: {
            click(event) {
                event.subject = "activateTab";
                event.tab = this;
            }
        }
    }
}