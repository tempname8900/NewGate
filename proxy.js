function getData(sKey) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(sKey, function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}

function GenerateWhiteListFilter(WhiteList) {
  var WhiteListArray = WhiteList.split("|");
  var WhiteListFilter_Return = "(host == '"+WhiteListArray[0]+"')";
  for (let i = 1; i < WhiteListArray.length; i++) {
    WhiteListFilter_Return += "||(host == '"+WhiteListArray[i]+"')";
  }
  return WhiteListFilter_Return;
}

function SelectConnectionType(ConnectionType, Whitelist, ProxyData) {
  switch (ConnectionType) {
    case 'pac':
      return configPac = {
        mode: "pac_script",
        pacScript: {
          data: "function FindProxyForURL(url, host) {\n" +
                "  if (shExpMatch(host, '"+Whitelist+"')){\n" +
                "    return 'PROXY "+ProxyData[0]+":"+ProxyData[1]+"';}\n" +
                "  else {\n" +
                "  return 'DIRECT';}\n" +
                "}"
        }
      };

    case 'pacstrict':
      return configPac = {
        mode: "pac_script",
        pacScript: {
          data: "function FindProxyForURL(url, host) {\n" +
                "  if ("+Whitelist+"){\n" +
                "    return 'PROXY "+ProxyData[0]+":"+ProxyData[1]+"';}\n" +
                "  else {\n" +
                "  return 'DIRECT';}\n" +
                "}"
        }
      };
  
    case 'all':
      return configAll = {
        mode: "fixed_servers",
        rules: {
        singleProxy: {
            host: ProxyData[0],
            port: parseInt(ProxyData[1])
        },
        bypassList: ["localhost"]
        }
      };
     default:
      return false;
  }
}

function SetProxy() {
  chrome.storage.local.get(["ConType", "Whitelist", "ProxyData"], function(result) {
    if (result.ProxyData) {
      ProxyData = result.ProxyData.split(':');

      switch (result.ConType) {
        case 'pacstrict':
          WhiteListFilter = GenerateWhiteListFilter(result.Whitelist);
          break;
      
        default:
          WhiteListFilter = result.Whitelist;
          break;
      }
      Config = SelectConnectionType(result.ConType, WhiteListFilter, ProxyData);
      if (Config) {
        chrome.proxy.settings.set({value:Config});
      }
      else {
        chrome.proxy.settings.clear({scope:'regular'});
      }
    }
  });
}
function callbackFnTest(details, callback) {
  console.log(details.isProxy);
  if (details.isProxy) {
    chrome.storage.local.get(["ConType", "ProxyData"], function(result) {
      ProxyData = result.ProxyData.split(':');
      ProxyUser = {
        username: ProxyData[2],
        password: ProxyData[3]
        }
      callback({authCredentials: ProxyUser});
    });
  }
  else {
    callback();
  }
}

SetProxy();

chrome.webRequest.onAuthRequired.addListener(
  callbackFnTest,
  {urls: ["*://*/*"]},
  ["asyncBlocking"]
);