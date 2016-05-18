// 休講・補講情報ページ
var lec_can_page_url = "https://www.ead.tut.ac.jp/board/main.aspx"

$(function(){
    // 休講・補講お知らせページへの移動
    $("#jp_lec_can_button").click(function (){
        chrome.tabs.create({url: lec_can_page_url})
        console.log("clicked jp");
    });

    // saveボタンの処理
    $("#save").click(function (){
        var common = false;
        if ($("#com").prop('checked')){
            common = true;
        }
        chrome.storage.local.set({grade:$("#select_grade").val()}, function(){});
        chrome.storage.local.set({cls:$("#select_class").val()}, function(){});
        chrome.storage.local.set({com: common}, function(){});
        console.log('save');

        chrome.tabs.getSelected(null, function(tab) {
            var code = 'update_view();';
            chrome.tabs.executeScript(tab.id, {code: code});
        });
    });

    // ローカルストレージに設定されている値を設定
    chrome.storage.local.get(function(items){
        if (items.grade != null){
            $("#select_grade option[value=" + items.grade + "]").attr("selected", true);
        }else{
            console.log("null");
        }
        if (items.cls != null) {
            $("#select_class option[value=" + items.cls + "]").attr("selected", true);
        };
        if (items.com != null) {
            if(items.com == true){
                $('#com').prop("checked", true);
            }
        };
    });
});
