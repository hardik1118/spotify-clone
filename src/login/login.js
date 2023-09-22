import { ACCESS_TOKEN } from "../common";

const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const scopes = "playlist-read-private user-top-read playlist-read-private";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const APP_URL = import.meta.env.VITE_APP_URL;
const params = new URLSearchParams(window.location.search);
let code = params.get("code");

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector("#spotify-login-button");
  loginButton.addEventListener("click", redirectToAuthCodeFlow);
});

window.addEventListener("load", async () => {
  let accessToken = localStorage.getItem(ACCESS_TOKEN);

  if (accessToken) {
    window.location.href = `${APP_URL}/dashboard/dashboard.html`;
  }

  if (code) {
    accessToken = await getAccessToken(CLIENT_ID, code);
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN, accessToken);
    }
    window.opener.location.href = `${APP_URL}/dashboard/dashboard.html`;
  }
  window.close();
});

export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("response_type", "code");
  params.append("redirect_uri", REDIRECT_URI);
  params.append("scope", scopes);
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  window.open(url, "login", "left=100,top=100,height=600,width=400");
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAccessToken(code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}
