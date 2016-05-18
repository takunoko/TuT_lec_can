(function(){
    // タブをアプデした際に実行
    chrome.tabs.onUpdated.addListener(function(tabId){
        chrome.pageAction.show(tabId);
    })
})();
