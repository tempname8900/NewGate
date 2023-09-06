import {InitialSetUp, SetProxy, callbackAuth, SetAdditionalHosts} from "./js/chromeapi.js";
InitialSetUp();
SetProxy();

chrome.webRequest.onAuthRequired.addListener(
  callbackAuth,
  {urls: ["<all_urls>"]},
  ["asyncBlocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
  SetAdditionalHosts,
  {urls: ["*://*/*"]}
);