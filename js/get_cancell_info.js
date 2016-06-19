// 休講 Cancel
// 補講 Supplement

$(document).ready(function(){
    update_view();
});

// 休講情報の番号を非表示ボタンに置き換える
function add_hidden_button(){
    // ボタンの追加処理
    $("#grvCancel > tbody > tr > td:first-child").css('width', '5%');
    $("#grvCancel > tbody > tr > td:first-child").html('<button class="delete_button">非表示</button>');

    $("#grvSupplement > tbody > tr > td:first-child").css('width', '5%');
    $("#grvSupplement > tbody > tr > td:first-child").html('<button class="delete_button">非表示</button>');

    // ボタンクリック時のイベント
    $(".delete_button").on("click", function(){
        // 教科名を取得
        sub_name = ($(this).closest('tr').children('td:eq(3)').get(0).innerHTML);
        add_hidden_list(sub_name);
    });
}

function add_hidden_list(name){
    chrome.storage.local.get(function(items) {
        hidden_list = (items.hidden_list == null) ? [] : JSON.parse(items.hidden_list);
        if ($.inArray(name, hidden_list) >= 0) {
            // 存在する
        }else{
            // 未追加．追加する
            hidden_list.push(name);
            chrome.storage.local.set({hidden_list:JSON.stringify(hidden_list)}, function(){});
        }
        // 更新した情報で再描画
        var tb_c = document.getElementById('grvCancel');
        var tb_u = document.getElementById('grvSupplement');
        subject_hidden(tb_c.rows, hidden_list);
        subject_hidden(tb_u.rows, hidden_list);
    });
}

function update_view(){
    var tb_c = document.getElementById('grvCancel');
    var tb_u = document.getElementById('grvSupplement');

    // 自動更新を削除
    $('body').removeAttr("onload");
    // 謎のformタグの削除
    $('form[name=frmMain]').children().unwrap();

    // ページの情報
    var tb_c_r = tb_c.rows;
    var tb_s_r = tb_u.rows;

    // 設定の初期化
    var grade = '';
    var cls = '';

    // 非同期処理なため、入れ子で書いておく
    chrome.storage.local.get(function(items) {
        var g = items.grade;
        var c = items.cls;
        var com = items.com;

        my_data = conv_g_c( g, c);

        // 未定義状態ではtrueに設定
        if(com == null){com = true;}

        hiddenUnnecessaryData(tb_c_r, my_data.grade, my_data.cls, com);
        hiddenUnnecessaryData(tb_s_r, my_data.grade, my_data.cls, com);
    });

    // 要素の非表示について
    hidden_list = [];
    chrome.storage.local.get(function(items) {
        hidden_list = (items.hidden_list == null) ? [] : JSON.parse(items.hidden_list);

        // 教科名による非表示
        subject_hidden(tb_c_r, hidden_list);
        subject_hidden(tb_s_r, hidden_list);
    });

    // 非表示ボタンの追加
    add_hidden_button();

    // 日付のハイライト
    day_hilight(tb_c_r, 0);
    day_hilight(tb_s_r, 1);
}

// 要素を非表示にする関数
function hiddenUnnecessaryData(tb_r, grade, cls, common_cls_f) {
    if (common_cls_f == true){
        cls += "|共通";
    }

    // 不要な要素の削除
    for (var i = 1, len = tb_r.length; i < len; i++) {
        if (tb_r[i].cells[5].innerText.match(grade) == null || tb_r[i].cells[6].innerText.match(cls) == null) {
            tb_r[i].style.display = 'none';
        }else{
            tb_r[i].style.display = '';
        }
    }
}

// パターンマッチングに利用するための正規表現に変換する
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

// パターンの教科名の情報をhiddneにする
function subject_hidden(tb_r, hidden_list){
    // パターン文字列がなしの場合は関数を抜ける
    if (hidden_list.length == 0){
        return;
    }

    // パターンマッチに利用する文字列を生成する
    hidden_str = "";
    hidden_str = convert_regexp(hidden_list);

    for (var i = 1, len = tb_r.length; i < len; i++) {
        if (tb_r[i].cells[3].innerText.match(hidden_str) != null){
            tb_r[i].style.display = 'none';
        }else{
            // ワンちゃん 必要?
            // tb_r[i].style.display = '';
        }
    }
}

// ハイライトの実行
// state = 0:休講 | 1:補講
function day_hilight(tb_r, state){
    // 本日の日付のハイライト
    today = new Date();
    year = today.getFullYear();
    month = today.getMonth()+1;
    day = today.getDate();

    if (parseInt(month).toString(10).length == 1){
        month = "0" + month;
    }
    if (parseInt(day).toString(10).length == 1){
        day = "0" + day;
    }
    var date = (year + "/" + month + "/" + day);

    for (var i = 0, len = tb_r.length; i < len; i++) {
        if (tb_r[i].cells[1].innerText.match(date)){
            tb_r[i].style.backgroundColor = (state == 0) ? '#afeeee' : '#f93';
        }
    }
}

// 検索文字列と選択を合わせる
function conv_g_c(g, c){
    var gr, cl;

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

    return {grade: gr, cls: cl}
}
