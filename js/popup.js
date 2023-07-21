async function f1(callback){
    var data = 'hui'
    callback(data);
}

function f2(data_test) {
    alert(data_test);
}

$('#SaveWhitelist').click(function (e) { 
    e.preventDefault();
    var WhiteList = $('#Whitelist').val().replace(/\n/g, "|");
    SetProxy(chrome.storage.local.set({ Whitelist: WhiteList }));
});
$('#SaveProxyData').click(function (e) { 
    e.preventDefault();
    var ProxyData = $('#ProxyData').val();
    SetProxy(chrome.storage.local.set({ ProxyData: ProxyData }));
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

$(document).ready(function () {
    chrome.storage.local.get(["ConType", "Whitelist", "ProxyData"], function(result){
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