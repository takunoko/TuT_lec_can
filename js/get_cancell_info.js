// 選択された項目以外の行を非表示にするスクリプト

// 休講 Cancel
// 補講 Supplement
// var tb_c = document.getElementById('grvCancel');
// var tb_u = document.getElementById('grvSupplement');

// とりあえずページが読み込まれた時点で実行
// update_view();

// 休講情報の番号を非表示ボタンに置き換える
function add_hidden_button(tb_r){
    console.log("ボタン追加");
    // とりあえずボタンを追加した．
    // cssいじったり，対応するJS書いたりする．
    $("#grvCancel > tbody > tr > td:first-child").html("<button>削除</button>");
}

function update_view(){
    // debug
    var tb_c = document.getElementById('grvCancel');
    var tb_u = document.getElementById('grvSupplement');

    // ページの情報
    var tb_c_r = tb_c.rows;
    var tb_s_r = tb_u.rows;

    // 設定の初期化
    var grade = '';
    var cls = '';

    // 非同期処理なため、入れ子で書いておく
    // chrome.storage.local.get(function(items) {
    //     var g = items.grade;
    //     var c = items.cls;
    //     var com = items.com;

    //     my_data = conv_g_c( g, c);

    //     // 未定義状態ではtrueに設定
    //     if(com == null){com = true;}

    //     hiddenUnnecessaryData(tb_c_r, my_data.grade, my_data.cls, com);
    //     hiddenUnnecessaryData(tb_s_r, my_data.grade, my_data.cls, com);
    // });

    // debug
    // 削除ボタンの追加
    add_hidden_button(tb_c_r);

    // 要素の非表示について
    hidden_list = ["確率・統計論(確率・統計論-b)","ソフトウェア演習Ⅰ(ソフトウェア演習Ⅰ-a)"];
    // hidden_list = [];

    my_data = conv_g_c( "","");
    com = false;
    hiddenUnnecessaryData(tb_c_r, my_data.grade, my_data.cls, com);
    hiddenUnnecessaryData(tb_s_r, my_data.grade, my_data.cls, com);

    subject_hidden(tb_c_r, hidden_list);
    subject_hidden(tb_s_r, hidden_list);

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
    regexp_str = pattern_list[0].replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    for (var s = 1; s < pattern_list.length; s++) {
        regexp_str += "|" + pattern_list[s]
            .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)');

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
