// 選択された項目以外の行を非表示にするスクリプト

// 休講 Cancel
// 補講 Supplement
var tb_c = document.getElementById('grvCancel');
var tb_u = document.getElementById('grvSupplement');

// 個々の値をもってきたい
update_view();

function update_view(){
    // ページの情報
    tb_c_r = tb_c.rows;
    tb_s_r = tb_u.rows;

    // 設定の初期化
    var grade = '';
    var cls = '';

    // 非同期処理なため、入れ子で書いておく
    chrome.storage.local.get(function(items) {
        var g = items.grade;
        var c = items.cls;
        var com = items.com;

        console.log("com: " + com);

        my_data = conv_g_c( g, c);

        hiddenUnnecessaryData(tb_c_r, my_data.grade, my_data.cls, com);
        hiddenUnnecessaryData(tb_s_r, my_data.grade, my_data.cls, com);
    });
}

// 要素を非表示にする関数
function hiddenUnnecessaryData(tb_r, grade, cls, common_cls_f) {
    if (common_cls_f == true){
        cls += "|共通";
    }
    console.log("grade : " + grade);
    console.log("cls   : " + cls);

    for (var i = 1, len = tb_r.length; i < len; i++) {
        if (tb_r[i].cells[5].innerText.match(grade) == null || tb_r[i].cells[6].innerText.match(cls) == null) {
            tb_r[i].style.display = 'none';
        }else{
            tb_r[i].style.display = '';
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

