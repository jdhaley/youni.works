const app = window.opener.app;
if (!app) {
	throw new Error("opener has no app object.");
}
app.initilizeFrame(window);

