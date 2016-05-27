// 休講・補講情報ページ
var lec_can_page_url = "https://www.ead.tut.ac.jp/board/main.aspx"

$(function(){
    // 休講・補講お知らせページへの移動
    $("#jp_lec_can_button").click(function (){
        chrome.tabs.create({url: lec_can_page_url})
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

        chrome.tabs.getSelected(null, function(tab) {
            var code = 'update_view();';
            chrome.tabs.executeScript(tab.id, {code: code});
        });
    });

    // ローカルストレージに設定されている値を設定
    chrome.storage.local.get(function(items){
        if (items.grade != null){
            $("#select_grade option[value=" + items.grade + "]").attr("selected", true);
        }
        if (items.cls != null) {
            $("#select_class option[value=" + items.cls + "]").attr("selected", true);
        }
        if (items.com != null) {
            if(items.com == true){
                $('#com').prop("checked", true);
            }
        }else{
            // 未定義状態でチェックが入ってるように
            $('#com').prop("checked", true);
        }
    });

    // 休講，補講情報を持ってくる
    // 参考: https://developer.chrome.com/apps/app_external#external
    $(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', lec_can_page_url, true); // サーバーから非同期でデータを取得
        xhr.responseType = 'document';  // レスポンス型をDocument(DOM形式)にする
        xhr.onload = function(e){
            console.log("aaa");
            console.log(xhr.responseXML);
            dom_data = xhr.responseXML;
            var tb_c = dom_data.getElementById('grvCancel');
            var tb_u = dom_data.getElementById('grvSupplement');
            var tb_c_r = tb_c.rows;
            var tb_s_r = tb_u.rows;

            var grade = "B3";
            var cls = "情報・知能";
            var common_cls_f = true;

            var can_list = get_change_list(tb_c_r, grade, cls, common_cls_f);
            console.log(can_list);

            if (can_list.length > 0) {
                $('#cancel_table tr').eq(1).css('display', 'none');
            };

            for (var i = 0; i < can_list.length; i++) {
                row_txt  = '<tr class="cancel_table_tr">\n';
                row_txt += '<td class="tab_time tab_time_d" scope="row">' + can_list[i][0].cells[2].innerText + '</td>\n';
                row_txt += '<td class="tab_state tad_state_d" scope="row">' + can_list[i][1] + '</td>';
                row_txt += '<td class="tab_sub tab_sub_d" scope="row">' + can_list[i][0].cells[3].innerText + '</td>\n';
                row_txt += '<td class="tad_teach tab_teach_d" scope="row">' + can_list[i][0].cells[4].innerText + '</td>';
                row_txt += '</tr>';
                $('#cancel_table').append(row_txt);
            };
        };
        xhr.send();
    });

});

// 対応する行を取得する
function get_change_list(tb_r, grade, cls, common_cls_f){
    // 日付関連
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1;
    var day = today.getDate();

    // 日付データの整形 0を入れる
    if (parseInt(month).toString(10).length == 1)
        month = "0" + month;
    if (parseInt(day).toString(10).length == 1)
        day = "0" + day;

    var date = (year + "/" + month + "/" + day);

    // 休講などデータ
    var can_list = new Array();

    if (common_cls_f == true){
        cls += "|共通";
    }

    // 条件に一致する行を取り出す．
    for (var i = 1, len = tb_r.length; i < len; i++) {
        if (tb_r[i].cells[1].innerText.match(date) && tb_r[i].cells[5].innerText.match(grade) && tb_r[i].cells[6].innerText.match(cls)) {
            tmp_data = [tb_r[i],"休"]
            can_list.push(tmp_data);
            // console.log(tb_r[i].cells[3]);
        }
    }

    return can_list;
}
