(function(){
    // タブをアプデした際に実行
    chrome.tabs.onUpdated.addListener(function(tabId){
        chrome.pageAction.show(tabId);
    })

    // chrome.pageAction.onClicked.addListener(function(tab){
    //     //chrome.tabs.insertCSS(tab.id, { file:"style.css" });
    //     chrome.tabs.executeScript(null,{ file: "js/jquery-1.12.3.min.js"},
    //         function(){
    //             chrome.tabs.executeScript(null,{file: "js/get_cancell_info.js"});
    //         });
    // });

    // localStorage$B$KBP$9$k%j%/%(%9%H$rBT$A<u$1$k!#(B
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method == "getLocalStorage"){
            sendResponse({data: localStorage[request.key]});
        }else{
            sendResponse({}); // snub them.
        }
    });

})();
