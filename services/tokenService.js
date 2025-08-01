const { default: axios } = require("axios");
const qs = require("querystring");

async function generateAccessToken() {
  try {
    const data = qs.stringify({
      grant_type: process.env.OAUTH_GRANT_TYPE,
      username: process.env.OAUTH_USERNAME,
      password: process.env.OAUTH_PASSWORD,
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      scope: process.env.OAUTH_SCOPE,
    });

    const config = {
      method: "post",
      url: process.env.ACCESS_TOKEN_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Error in generateAccessToken:", error.message);
    return null;
  }
}

async function generateServerKey(token_type, access_token, session_state) {
  try {
    const data = {
      companyCode: process.env.COMPANY_CODE,
      packageName: process.env.PACKAGE_NAME,
      data: {},
    };

    const config = {
      method: "post",
      url: process.env.GET_SERVER_URL,
      headers: {
        Authorization: `${token_type} ${access_token}`,
        "Content-Type": "application/json",
        Cookie: `__cfruid=${session_state}`,
      },
      data,
    };

    const response = await axios(config);
    return response.data.serverKey;
  } catch (error) {
    console.error("Error in generateServerKey:", error.message);
    return null;
  }
}

async function getToken() {
  try {
    const token = await generateAccessToken();
    if (!token) throw new Error("Token is null");

    const serverKey = await generateServerKey(
      token.token_type,
      token.access_token,
      token.session_state
    );

    return { ...token, serverKey };
  } catch (error) {
    console.error("Error in getToken:", error.message);
    return null;
  }
}

module.exports = { getToken };
