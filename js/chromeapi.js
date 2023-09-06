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
    chrome.storage.local.get(["ConType", "Whitelist", "ProxyData", "ahList", "AdditionalHosts"], function(result) {
        if (result.ProxyData) {
            var ProxyData = result.ProxyData.split(':');

            switch (result.ConType) {
                case 'pacstrict':
                    if (result.AdditionalHosts === 'yes') {
                        var ahList_ = AdditionalHostsListGetForProxy(result.ahList);
                        var WhiteListCombined = result.Whitelist+ahList_;
                        var WhiteListFilter = GenerateWhiteListFilter(WhiteListCombined);
                    }
                    else {
                        var WhiteListFilter = GenerateWhiteListFilter(result.Whitelist);
                    }
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

export function SetAdditionalHosts(details) {
    var BlackList = Array("mc.yandex.ru", "www.google-analytics.com", "cdnjs.cloudflare.com", "www.google.com", "apis.google.com", "accounts.google.com", "www.googletagmanager.com", "www.google.ru", "analytics.google.com", "static.cloudflareinsights.com", "cloudflareinsights.com", "code.jquery.com", "cdn.jsdelivr.net", "imgur.com", "fonts.googleapis.com", "translate.google.com", "firestore.googleapis.com", "blackhole.beeline.ru");
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.storage.local.get(["Whitelist", "ConType", "AdditionalHosts", "ahList"], function(result) {
            var WhiteListArray = result.Whitelist.split("|");
            if (result.ConType === "pacstrict" && tabs[0] && result.AdditionalHosts === 'yes') {
                var Domen = tabs[0].url.split('/')[2];
                if (details.initiator !== undefined) {
                    var Initiator = details.initiator.split('/')[2];;
                }
                if (WhiteListArray.includes(Domen)) {
                    var AdHost = details.url.split('/')[2];
                    if (result.ahList && Domen !== AdHost && details.initiator !== undefined && Initiator===Domen && !BlackList.includes(AdHost)) {
                        var ahList = AdditionalHostsListGet(result.ahList);
                        if (ahList[Domen] !== undefined) {
                            if (!ahList[Domen].includes(AdHost)) {
                                ahList[Domen].push(AdHost);
                            }
                        }
                        else {
                            ahList[Domen] = [];
                            ahList[Domen].push(AdHost);
                        }
                        var test5 = AdditionalHostsListForm(ahList);
                        chrome.storage.local.set({ahList:test5}, function(params) {
                            SetProxy();
                        });
                    }
                    else {
                        if (Domen !== AdHost && details.initiator !== undefined && Initiator===Domen && !BlackList.includes(AdHost)) {
                            var NewAhList = Domen+"@"+AdHost;
                            chrome.storage.local.set({ahList:NewAhList}, function(params) {
                                SetProxy();
                            });
                        }
                    }
                }
            }
        });
    });
}

export function callbackAuth(details, callback) {
    var ProxyData;
    var ProxyUser;
    if (details.isProxy) {
        chrome.storage.local.get(["ConType", "ProxyData"], function(result) {
            ProxyData = result.ProxyData.split(':');
            ProxyUser = {
            username: ProxyData[2],
            password: ProxyData[3]
            };
            callback({authCredentials: ProxyUser});
        });
    }
    else {
      callback();
    }
}

export function RemoveVarFromLocalStorage(VarName) {
    chrome.storage.local.remove([VarName],function(){
        var error = chrome.runtime.lastError;
           if (error) {
               console.error(error);
           }
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

export function UpdateAdditionalHosts(WhiteList) {
    chrome.storage.local.get(["AdditionalHosts", "ahList"], function(result) {
        var WhiteListArray = WhiteList.split("|");
        var ahList = AdditionalHostsListGet(result.ahList);
        var NewAdditionalHosts = [];
        for (var MainDomain in ahList) {
            if (WhiteListArray.includes(MainDomain)) {
                NewAdditionalHosts[MainDomain] = ahList[MainDomain];
                console.log(NewAdditionalHosts);
            }
            else {
                console.log(MainDomain);
            }
        }
        var NewAdditionalHostsString = AdditionalHostsListForm(NewAdditionalHosts);
        if (NewAdditionalHostsString === undefined) {
            NewAdditionalHostsString = "";
        }
        chrome.storage.local.set({ahList:NewAdditionalHostsString});
    });
}

export function AdditionalHostsListGet(AdditionalHostsString) {
    if (AdditionalHostsString !== undefined) {
        
    }
    else {
        return "";
    }
    if (AdditionalHostsString.length === 0) {
        return [];
    }
    var ReturnArray = [];
    var AhSubarray = AdditionalHostsString.split('|');
    AhSubarray.forEach((AhSubarray_value, AhSubarray_key) => {
        var DomainArray = AhSubarray_value.split('@');
        var MainDomain = DomainArray[0];
        var AddHosts = DomainArray[1].split('*');
        if (AddHosts.length < 2) {
            ReturnArray[MainDomain] = Array(AddHosts[0]);
        }
        else {
            ReturnArray[MainDomain] = [];
            AddHosts.forEach((AddHosts_value, AddHosts_key) => {
                ReturnArray[MainDomain].push(AddHosts_value);
            });
        }
    });
    return ReturnArray;
}

function AdditionalHostsListGetForProxy(AdditionalHostsString) {
    if (AdditionalHostsString !== undefined) {
        
    }
    else {
        return "";
    }
    if (AdditionalHostsString.length === 0) {
        return "";
    }
    var ReturnString_ = "";
    var AhSubarray = AdditionalHostsString.split('|');
    AhSubarray.forEach((AhSubarray_value, AhSubarray_key) => {
        var DomainArray = AhSubarray_value.split('@');
        var AddHosts = DomainArray[1].replaceAll("*", "|");
        ReturnString_+="|";
        ReturnString_+=AddHosts;
    });
    return ReturnString_;
}

function AdditionalHostsListForm(AdditionalHostsArray) {
    for (var MainDomain in AdditionalHostsArray) {
        if (ReturnString === undefined) {
            var ReturnString = "";
            ReturnString+=MainDomain;
            ReturnString+="@";
            var Merged = AdditionalHostsArray[MainDomain].join('*');
            ReturnString+=Merged;
        }
        else {
            ReturnString+="|";
            ReturnString+=MainDomain;
            ReturnString+="@";
            var Merged = AdditionalHostsArray[MainDomain].join('*');
            ReturnString+=Merged;
        }
    }
    return ReturnString;
}