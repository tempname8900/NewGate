// async function f1(f1_test, callback) {
    
//     var f1 = 'f1';
//     alert(f1);
//     callback();
//     return f1_test;
//     // return f1;
//   }

// async function f2() {
//     var f2 = 'f2';
//     alert(f2);
// }
// f1('f3_test', function(){
//     f2();
// });

// async function f1(f1_test, callback) {
//     alert(f1_test);
//     callback();
// }

// async function f2(f2_test, callback) {
//     alert(f2_test);
//     var f2_data = 'hui';
//     callback(f2_data);
// }

// f1('f1_test', function() {
//     f2('f2_test', function(params) {
//         alert(params);
//     });
// });
// var f1_test = f1('f3_test');
// alert(f1_test);

async function f1(callback){
    var data = 'hui'
    callback(data);
}

function f2(data_test) {
    alert(data_test);
}

// f1(f2);

// function getData(sKey) {
//     return new Promise(function(resolve, reject) {
//       chrome.storage.local.get(sKey, function(items) {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError.message);
//           reject(chrome.runtime.lastError.message);
//         } else {
//           resolve(items[sKey]);
//         }
//       });
//     });
//   }
  

// var data = getData('ConType').then(function(item) {
//     // Returns "bar"
//     return item;
//     // console.log(item);
//   });

//   alert(chrome.storage.local.get("ProxyData"));
// function callbackFn(details, callback) {
//     function gotCredentials(credentials) {
//       callback({authCredentials: credentials});
//     }
//     return {
//         authCredentials: {
//         username: ProxyData[2],
//         password: ProxyData[3]
//         }
//     };
//   }



// chrome.storage.local.get("test", function(result) {
//     alert(result.test);
//     chrome.storage.local.get("Whitelist", function(result2) {
//         alert(result2.Whitelist);
//       });
//   });

// $('#pac').click(function (e) {
//     e.preventDefault();
//     SetProxy(chrome.storage.local.set({ test: "pac" }));
//     // chrome.storage.local.set({ test: "pac" }).then(() => {
//     //     console.log("Value is set");
//     //     SetProxy();
//     // });
// });
// $('#all').click(function (e) {
//     e.preventDefault();
//     SetProxy(chrome.storage.local.set({ test: "all" }));
//     // chrome.storage.local.set({ test: "all" }).then(() => {
//     //     console.log("Value is set");
//     //     SetProxy();
//     // });
// });
// $('#none').click(function (e) {
//     e.preventDefault();
//     SetProxy(chrome.storage.local.set({ test: "none" }));
//     // chrome.storage.local.set({ test: "none" }).then(() => {
//     //     console.log("Value is set");
//     //     SetProxy();
//     // });
// });
$('#SaveWhitelist').click(function (e) { 
    e.preventDefault();
    // SetProxy();
    var WhiteList = $('#Whitelist').val().replace(/\n/g, "|");
    // alert($('#whitelist').val());
    // alert(WhiteList);
    SetProxy(chrome.storage.local.set({ Whitelist: WhiteList }));
    // chrome.storage.local.get("test", function(result) {
    //     alert(result.test);
    // });
});
$('#SaveProxyData').click(function (e) { 
    e.preventDefault();
    // SetProxy();
    // alert($('#ProxyData').val());
    var ProxyData = $('#ProxyData').val();
    // alert(WhiteList);
    SetProxy(chrome.storage.local.set({ ProxyData: ProxyData }));
    // chrome.storage.local.get("test", function(result) {
    //     alert(result.test);
    // });
});
$('#ReadWhitelist').click(function (e) {
    e.preventDefault();
    // SetProxyTest();
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
    // alert($(this).attr('action'));
    var Action = $(this).attr('action');
    $('button[action]').each(function() {
        $(this).removeClass("ActiveType");
      });
    $(this).addClass("ActiveType");
    SetProxy(chrome.storage.local.set({ ConType: Action }));
});
// $('#read').click(function (e) {
//     e.preventDefault();
//     SetProxy();
// });

// chrome.storage.local.get("test").then((result) => {
//     console.log(result.test);
// });