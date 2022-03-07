const axios = require("axios");
const generateAblyJWT = require("./generate-ably-jwt.js");

exports.handler = async function (event, context) {
  const { queryStringParameters } = event;
  const { id } = queryStringParameters || {};
  const { clientContext } = context || {};

  console.log({ queryStringParameters });
  console.log({ clientContext });

  const { identity } = context.clientContext || {};
  const { token, url } = identity || {};

  const userUrl = `${url}/admin/users/${id}`;
  const Authorization = `Bearer ${token}`;

  console.log({ identity, id, token, url, userUrl, Authorization });

  let response;

  /*

    We Use client context and querystring ID value
    to check the user exists by retrieving their
    User Identity object.

    Then we inspect that accounts metadata for role flags,
    which are added via the Identity dashboard,
    if it contains "Banned" we do not reissue the token

  */

  await axios
    .get(userUrl, { headers: { Authorization } })
    .then(({ data }) => {
      console.log("Success! User identity", data);

      const banned = /^banned/i;
      const { roles = [] } = data.app_metadata;
      const reject = roles.some((item) => banned.test(item));

      // delegate the error message to the catch clause.
      if (reject) throw new Error(`User with id [${id}] has been banned`);

      const settings = {
        clientId: id,
        apiKey: process.env.ABLY_APIKEY,
        capability: process.env.ABLY_CAPABILITY,
        ttlSeconds: Number(process.env.ABLY_TTLSECONDS),
      };

      response = {
        statusCode: 200,
        body: generateAblyJWT(settings),
        headers: { "Content-Type": "application/jwt" },
      };
    })
    .catch((error) => {
      console.log("Failed to get user!");
      response = {
        statusCode: 500,
        body: `Internal Error: ${error}`,
        headers: { "Content-Type": "text/plain" },
      };
    });

  console.log("response payload", response);
  return response;
};
