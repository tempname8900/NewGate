import {SetProxy, RemoveVarFromLocalStorage, UpdateAdditionalHosts} from "./chromeapi.js";
$('#SaveWhitelist').click(function (e) { 
    e.preventDefault();
    var WhiteList = $('#Whitelist').val().replace(/\n/g, "|");
    UpdateAdditionalHosts(WhiteList);
    SetProxy(chrome.storage.local.set({ Whitelist: WhiteList }));
});
$('#SaveProxyData').click(function (e) { 
    e.preventDefault();
    var ProxyData = $('#ProxyData').val();
    SetProxy(chrome.storage.local.set({ ProxyData: ProxyData }));
});
$('#AdditionalHosts').click(function (e) { 
    if ($(this).is(':checked')) {
        $(this).prop('checked', true);
        chrome.storage.local.set({ AdditionalHosts: 'yes' }, function(res) {
            chrome.storage.local.get("AdditionalHosts", function(result) {
            });
        });
    }
    else {
        $(this).prop('checked', false);
        chrome.storage.local.set({ AdditionalHosts: 'no' }, function(res) {
            chrome.storage.local.get("AdditionalHosts", function(result) {
            });
        });
    }
});
$('#ReadWhitelist').click(function (e) {
    e.preventDefault();
    chrome.storage.local.get("Whitelist", function(result) {
        alert(result.Whitelist);
    });
});
$('#ClearStorage').click(function (e) {
    e.preventDefault();
    chrome.storage.local.clear();
});
$('#ClearAH').click(function (e) {
    e.preventDefault();
    RemoveVarFromLocalStorage("ahList");
});
$('#AlertAH').click(function (e) {
    e.preventDefault();
    chrome.storage.local.get(["Whitelist", "ConType", "AdditionalHosts", "ahList"], function(result) {
        alert(result.ahList);
    });
});

$(document).ready(function () {
    chrome.storage.local.get(all => {
        for (const [key, val] of Object.entries(all)) {
          console.log(key);
        }
    });
    chrome.storage.local.get(["ConType", "Whitelist", "ProxyData", "AdditionalHosts"], function(result){
        if (result.Whitelist) {
            var Whitelist = result.Whitelist.split("|").join("\n");
            $("#Whitelist").val(Whitelist);
        }
        if (result.ProxyData) {
            $("#ProxyData").val(result.ProxyData);
        }
        if (result.ConType) {
            $("button[action='"+result.ConType+"']").addClass("ActiveType");
        }
        else {
            $("button[action='none']").addClass("ActiveType");
        }
        if (result.AdditionalHosts && result.AdditionalHosts === 'yes') {
            $('#AdditionalHosts').prop('checked', true);
        }
        else {
            $('#AdditionalHosts').prop('checked', false);
        }
    });
});

$('button[action]').click(function (e) { 
    e.preventDefault();
    var Action = $(this).attr('action');
    $('button[action]').each(function() {
        $(this).removeClass("ActiveType");
      });
    $(this).addClass("ActiveType");
    SetProxy(chrome.storage.local.set({ ConType: Action }));
});
