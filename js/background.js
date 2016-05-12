(function(){
    // tab がアップデートされたとき
    chrome.tabs.onUpdated.addListener(function(tabId){
        // ページアクションを出す
        chrome.pageAction.show(tabId);
    })

    // // ページアクションアイコンをクリックしたときの挙動
    // chrome.pageAction.onClicked.addListener(function(tab){
    //     //chrome.tabs.insertCSS(tab.id, { file:"style.css" });
    //     chrome.tabs.executeScript(null,{ file: "js/jquery-1.12.3.min.js"},
    //         function(){
    //             chrome.tabs.executeScript(null,{file: "js/get_cancell_info.js"});
    //         });
    // });

    // localStorageに対するリクエストを待ち受ける。
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.method == "getLocalStorage"){
            sendResponse({data: localStorage[request.key]});
        }else{
            sendResponse({}); // snub them.
        }
    });

})();
