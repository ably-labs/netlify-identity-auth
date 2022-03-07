const { netlifyIdentity } = window;
const user = netlifyIdentity.currentUser();


netlifyIdentity.on("login", (user) => {
  netlifyIdentity.close();
  console.log("User login", user);
});

netlifyIdentity.on("init", (user) => console.log("Initilize", user));
netlifyIdentity.on("logout", () => console.log("Logged out"));
netlifyIdentity.on("error", (err) => console.error("Error", err));
netlifyIdentity.on("open", () => console.log("Widget opened"));
netlifyIdentity.on("close", () => console.log("Widget closed"));
