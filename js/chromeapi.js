export function InitialSetUp() {
    chrome.storage.local.get(["AdditionalHosts"], function(result) {
        if (result.AdditionalHosts) {
            
        }
        else {
            chrome.storage.local.set({ AdditionalHosts: 'no' });
        }
    });
}

export function SetProxy() {
    chrome.storage.local.get(["ConType", "Whitelist", "ProxyData"], function(result) {
        if (result.ProxyData) {
            console.log(result.ProxyData);
            var ProxyData = result.ProxyData.split(':');

            switch (result.ConType) {
                case 'pacstrict':
                var WhiteListFilter = GenerateWhiteListFilter(result.Whitelist);
                break;
            
                default:
                var WhiteListFilter = result.Whitelist;
                break;
            }
            var Config = SelectConnectionType(result.ConType, WhiteListFilter, ProxyData);
            if (Config) {
                chrome.proxy.settings.set({value:Config});
            }
            else {
                chrome.proxy.settings.clear({scope:'regular'});
            }
        }
    });
}

export function SetAdditionalHosts(details){
    var Domen = details.url.split('/')[2];
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.storage.local.get(["Whitelist"], function(WhitelistResult) {
            if (tabs[0]) {
            console.log(WhitelistResult.Whitelist);
            console.log(Domen);
            console.log(tabs[0].url);
            console.log(tabs[0]);
            }
        });
    });
}

export function callbackFnTest(details, callback) {
    var ProxyData;
    var ProxyUser;
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

function GenerateWhiteListFilter(WhiteList) {
    var WhiteListArray = WhiteList.split("|");
    var WhiteListFilter_Return = "(host == '"+WhiteListArray[0]+"')";
    for (let i = 1; i < WhiteListArray.length; i++) {
      WhiteListFilter_Return += "||(host == '"+WhiteListArray[i]+"')";
    }
    return WhiteListFilter_Return;
  }
  
function SelectConnectionType(ConnectionType, Whitelist, ProxyData) {
    var configPac;
    var configAll;
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