/*

    An Ably JWT is not strictly an Ably construct,
    rather it is a JWT which has been constructed to
    be compatible with Ably.

    // stubing mock for crypto-js
    const CryptoJS = {
      HmacSHA256: (s) => s,
      enc: {
        Utf8: { parse: (s) => s },
        Base64: { stringify: (s) => s },
      },
    };
*/

const CryptoJS = require("crypto-js");

module.exports = function generateAblyJWT(props) {
  const { apiKey, clientId, capability, ttlSeconds } = props;

  const [appId, keyId, keySecret] = apiKey.split(/[\.\:]/g);
  const keyName = `${appId}.${keyId}`;

  const typ = "JWT"; // type
  const alg = "HS256"; // algorithm sha256
  const kid = keyName; // appId + keyId

  const currentTime = Math.floor(Date.now() / 1000);
  const iat = currentTime; // initiated at (seconds)
  const exp = currentTime + ttlSeconds; // expire after

  const header = { typ, alg, kid };
  const claims = {
    iat,
    exp,
    "x-ably-capability": capability,
    "x-ably-clientId": clientId,
  };

  const base64Header = encryptObject(header);
  const base64Claims = encryptObject(claims);

  const token = `${base64Header}.${base64Claims}`;
  const signature = b64(SHA256(token, keySecret));

  const jwt = `${token}.${signature}`;

  console.log({ header, claims, signature, jwt });
  return jwt;
};

function SHA256(token, secret) {
  return CryptoJS.HmacSHA256(token, secret);
}

function encryptObject(object) {
  const json = JSON.stringify(object);
  const parse = CryptoJS.enc.Utf8.parse(json);
  return b64(parse);
}

function b64(token) {
  return CryptoJS.enc.Base64.stringify(token)
    .replace(/\=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
