// option.htmlに対するJS

$(function(){
    // 現在の非表示科目を取得
    chrome.storage.local.get(function(items) {
        // 非表示リストの取得
        var hidden_list = (items.hidden_list == null) ? [] : JSON.parse(items.hidden_list);
        draw_hidden_list(hidden_list);
    });
    $('#setting_title').on('click', function(){
        location.reload();
    });
});

// 非表示リストをテーブルに追加
function draw_hidden_list(hidden_list){
    // 非表示リストの追加
    $('#hidden_list tr:not("#table_header")').remove();

    if (hidden_list.length == 0) {
        $('#hidden_list').append('\
                <tr class="hiden_sub_r">\
                <td colspan=2>\
                <div class="button_div">\
                非表示設定している科目はありません\
                </div>\
                </td>\
                </tr>\
                ');
    };

    for (var i = 0; i < hidden_list.length; i++) {
        $('#hidden_list').append('<tr class="hiden_sub_r">\
                <td class="hidden_sub_button">\
                <div class="button_div">\
                <button class="hidden_button ">再表示</button>\
                </div>\
                </td>\
                <td class="hidden_sub_n">'+hidden_list[i]+'</td>\
                </tr>');
    };

    // ボタンクリック時のイベントを追加
    $('.hidden_button').on("click", function(){
        sub_name = ($(this).closest('tr').children('td:eq(1)').get(0).innerText);
        remove_item(sub_name);
        console.log(sub_name);
    });
}

// 配列からの削除
function remove_item(sub_naem){
    chrome.storage.local.get(function(items) {
        // 現在のリストを取り出す
        hidden_list = (items.hidden_list == null) ? [] : JSON.parse(items.hidden_list);

        //debug
        console.log(hidden_list);

        // sub_nameと一致する要素の削除
        hidden_list.some(function(v, i){
            if (v == sub_name)
            hidden_list.splice(i,1);
        });
        // 更新後のリストを保存
        chrome.storage.local.set({hidden_list:JSON.stringify(hidden_list)}, function(){});

        // debug
        console.log("update list");
        console.log(hidden_list);
        draw_hidden_list(hidden_list);
    });
}
