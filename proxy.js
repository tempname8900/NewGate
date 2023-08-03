import {InitialSetUp, SetProxy, callbackFnTest, SetAdditionalHosts} from "./js/chromeapi.js";

InitialSetUp();

SetProxy();

chrome.webRequest.onAuthRequired.addListener(
  callbackFnTest,
  {urls: ["*://*/*"]},
  ["asyncBlocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
  SetAdditionalHosts,
  {urls: ["*://*/*"]},
);