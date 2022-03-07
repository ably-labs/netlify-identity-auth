function go(el) {
  /*
    get the user id from localstorage.
    This is only created once the user logs in
  */
  const user = localStorage.getItem("gotrue.user") || null;

  if (!user) {
    showMessage("Can't access user ID, please log in first.");
    return null;
  }

  /*
     Add the User's identity ID to the authURL
     to ensure the Ably token refresh has that credential
     we are binding the authURL and the user
  */

  const { id } = JSON.parse(user);
  const { origin } = window.location;
  const authUrl = `${origin}/.netlify/functions/ably-jwt?id=${id}`;

  console.log({ authUrl });

  window.ably = new Ably.Realtime({ authUrl });
  window.ably.connection.on(handleConnection(el));
}

function handleConnection(button) {
  /*
    This function defines the HTML button reference
    and returns a callback which will handle
    the subsequent messages from Ably servers
  */

  return function callback(e) {
    const { current, reason, retryIn } = e;
    const { tokenDetails, tokenParams, client } = ably.auth;
    const { message } = reason || {};

    console.log(ably, e);
    console.log({ message, retryIn });
    console.log({ tokenDetails, tokenParams });

    showMessage(message);

    button.className = current;
    button.innerHTML = current;
  };
}

let timer = null;
function showMessage(string = "") {
  const m = document.querySelector(".message");

  m.classList.remove("show");
  if (!string) return;

  m.classList.add("show");
  m.innerHTML = string;

  clearTimeout(timer);
  setTimeout(() => showMessage(), 5000);
}
