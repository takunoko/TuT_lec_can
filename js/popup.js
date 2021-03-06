// var lec_can_page_url = "https://www.ead.tut.ac.jp/board/main.aspx"
var lec_can_page_url = "http://ie.takunoko.com/www/LecCan_list.html"
var popup_day = 0;

$(function(){
    today = new Date;
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

            // ポップアップの更新
            $('#today_str').text(get_day_str(today));
            day = new Date();
            popup_day += 1;
            day.setDate( today.getDate() + popup_day);    // n日後に日付を移動
            $('#today_str').text(get_day_str(day));
            update_popup(day);
        });
    });

    // オプションページへのリンクボタン
    $("#link_option_page").click(function(){
        chrome.tabs.create({'url': "/option.html"});
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

    // 休講，補講情報を取得、popupに表示
    $(function() {
        $('#today_str').text(get_day_str(today));
        update_popup(today);
    });

    // 前日，当日，翌日ボタンの処理
    $("#button_next_day").click(function (){
        day = new Date();
        popup_day += 1;
        day.setDate( today.getDate() + popup_day);    // n日後に日付を移動
        $('#today_str').text(get_day_str(day));
        update_popup(day);
    });
    $("#button_prev_day").click(function (){
        day = new Date;
        popup_day -= 1;
        day.setDate( today.getDate() + popup_day);    // n日後に日付を移動
        $('#today_str').text(get_day_str(day));
        update_popup(day);
    });
    $("#button_today").click(function (){
        day = new Date;
        popup_day = 0;
        day.setDate( today.getDate() + popup_day);    // n日後に日付を移動
        $('#today_str').text(get_day_str(day));
        update_popup(day);
    });
});

// popupに本日の休講情報を表示
function update_popup(D_info){
    var grade = "";
    var cls = "";
    var com = true;

    // 読み込み中アニメーションの挿入
    $('#cancel_table').find("tr:gt(0)").remove();
    $('#cancel_table').append('<tr class="cancel_table_tr"><td colspan="4" id="tab_none">読み込み中...</td></tr>');

    // 学校ページから情報を取得
    var xhr = new XMLHttpRequest();
    xhr.open('GET', lec_can_page_url, true); // サーバーから非同期でデータを取得
    xhr.responseType = 'document';  // レスポンス型をDocument(DOM形式)にする
    xhr.onload = function(e){
        dom_data = xhr.responseXML;

        // 自分の情報の規定値の取得
        chrome.storage.local.get(function(items){
            my_data = conv_g_c( items.grade, items.cls, items.com);
            update_popup_today(dom_data, my_data.grade, my_data.cls, items.hidden_list, D_info);
        });
    };
    xhr.send();
}

function update_popup_today(dom_data, grade, cls, origin_hidden_list, D_info) {
    var tb_c = dom_data.getElementById('grvCancel');
    var tb_u = dom_data.getElementById('grvSupplement');

    var tb_c_r = tb_c.rows;
    var tb_s_r = tb_u.rows;

    var cs_data = create_data_frame(tb_c_r, tb_s_r);
    var hidden_list = (origin_hidden_list == null) ? [] : JSON.parse(origin_hidden_list);

    $('#cancel_table').find("tr:gt(0)").remove();

    // いい感じにデータをセレクトしたい。
    // 入り組むif文は使いたくない
    var cs_cnt = 0;
    for (var i = 0; i < cs_data.length; i++) {
        // 情報(学年・学科)の一致
        if (match_info(cs_data[i], grade, cls)){
            // 日付の一致
            if (match_day(new Date(cs_data[i][1]) ,D_info)){
                // 非表示リストに含まれていないか
                if (match_hidden_list(cs_data[i][3], hidden_list) != true) {
                    cs_cnt++;
                    if (cs_data[i][0] == '休'){
                        row_txt  = '<tr class="cancel_table_tr can">\n';
                    }else{
                        row_txt  = '<tr class="cancel_table_tr sup">\n';
                    }
                    row_txt += '<td class="tab_state tab_state_d" scope="row">' + cs_data[i][0] + '</td>';
                    row_txt += '<td class="tab_time tab_time_d" scope="row">' + cs_data[i][2] + '</td>\n';
                    row_txt += '<td class="tab_sub tab_sub_d" scope="row">' + cs_data[i][3] + '</td>\n';
                    row_txt += '<td class="tab_teach tab_teach_d" scope="row">' + cs_data[i][4] + '</td>';
                    row_txt += '</tr>';
                    $('#cancel_table').append(row_txt);
                }
            }
        }
    }
    if(cs_cnt == 0){
        $('#cancel_table').append('<tr class="cancel_table_tr"><td colspan="4" id="tab_none"> 休講・補講情報はありません </td></tr>');
    }
}

// 学年 学科が一致するか？
function match_info(data, grade, cls){
    if (data[5].match(grade) && data[6].match(cls)) {
        return true;
    }
    return false;
}

// 年と日付だけ一致していればTrueを返す
function match_day(a, b){
    if (a.getDate() == b.getDate() && a.getMonth() == b.getMonth() && a.getYear() == b.getYear()){
        return true;
    }
    return false;
}

// hidden_listにaの文字列が含まれるかどうか
function match_hidden_list(a, hidden_list){
    // hidden_listが空なら何もしない
    console.log(hidden_list);
    if (hidden_list.length == 0) {
        return false;
    }
    hidden_str = "";
    hidden_str = convert_regexp(hidden_list);
    console.log(a);

    if (a.match(hidden_str) != null){
        // nullじゃない -> 一致した。
        return true;
    }
    // hidden_listに含まれないとfalseを返す
    return false;
}
// パターンマッチングに利用する文字列を生成する
function convert_regexp(pattern_list){
    // パターンリストが空なら
    if (pattern_list.length <= 0) {
        return "";
    }

    // パターンの文字列を作成する
    // パターンの文字列を正規表現で利用できるようにエスケープする
    // ()しか対応してないから事故るかも．．．
    // この場合のパターンは完全一致で．
    regexp_str = '^' + pattern_list[0].replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)') + '$';
    for (var s = 1; s < pattern_list.length; s++) {
        regexp_str += "|^" + pattern_list[s]
            .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)') + '$';
    }

    return regexp_str;
}

// 休講・補講情報をまとめたデータを返す
function create_data_frame(tb_c_r, tb_s_r){
    // データ形式
    // (休/補講), 日付(ただの整数型), 次元, 時間割名, 担当教員, 開講年次, 開講学科, {学生への連絡, 補講の予定} / {教室, 備考}

    var cs_data = new Array();
    // 休講情報
    for (var i = 1, len = tb_c_r.length; i < len; i++) {
        var row_data = [];
        row_data[0] = "休";
        row_data[1] = Date.parse(tb_c_r[i].cells[1].innerText);
        for (var j = 2; j <= 6; j++){
            row_data[j] = tb_c_r[i].cells[j].innerText;
        }
        row_data[7] = [tb_c_r[i].cells[7].innerText, tb_c_r[i].cells[8].innerText];
        cs_data.push(row_data);
    }
    // 補講情報
    for (var i = 1, len = tb_s_r.length; i < len; i++) {
        var row_data = [];
        row_data[0] = "補";
        row_data[1] = Date.parse(tb_s_r[i].cells[1].innerText);
        for (var j = 2; j <= 6; j++){
            row_data[j] = tb_s_r[i].cells[j].innerText;
        }
        row_data[7] = [tb_s_r[i].cells[7].innerText, tb_s_r[i].cells[8].innerText];
        cs_data.push(row_data);
    }

    // 日付と時限でソート
    cs_data.sort(function(a,b){
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        if (a[2] < b[2]) return -1;
        if (a[2] > b[2]) return 1;
        return 0;
    });

    return cs_data;
}

// Dateを日付(文字列)に直す
function get_day_str(date){
    var y = date.getFullYear();
    var m = date.getMonth()+1;  // 得られる月が0-11なため
    var d = date.getDate();
    var w = date.getDay();
    var week = ["日","月","火","水","木","金","土"];

    ys = String(y);

    ds = d<10 ? "0" + String(d) : ds = String(d);
    ms = m<9 ? "0" + String(m) : String(m);
    ws = week[w];

    str = ys + "/" + ms + "/" + ds + "(" + ws + ")";

    return str;
}

// 検索文字列と選択を合わせる
function conv_g_c(g, c, com){
    var gr, cl, cm;

    // null = 未設定時
    if (g != null){
        if (g == 'all')
            gr = '';
        else
            gr = g;
    }else{
        gr = '';
    }

    // クラスの判定
    switch (c){
        case 'all':
            cl = '';
            break;
        case '1':
            cl = '機械';
            break;
        case '2':
            cl = '電気・電子情';
            break;
        case '3':
            cl = '情報・知能';
            break;
        case '4':
            cl = '環境・生命';
            break;
        case '5':
            cl = '建築・都市';
            break;
        default:
            // undefined(設定前なら)
            cl = '';
            break;
    }

    // 共通
    if (cl != ''){
        if(com == null || com == true){
            cl += "|共通";
        }
    }

    return {grade: gr, cls: cl}
}
