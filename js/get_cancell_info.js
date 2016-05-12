// 選択された項目以外の行を非表示にするスクリプト

// 休講 Cancel
// 補講 Supplement

var tb_c = document.getElementById('grvCancel');
var tb_u = document.getElementById('grvSupplement');
tb_c_r = tb_c.rows;
tb_s_r = tb_u.rows;

// 個々の値をもってきたい

var grade;
var cls;

// 設定の初期化
init_settings_value();

hiddenUnnecessaryData(tb_c_r, grade, cls);
hiddenUnnecessaryData(tb_s_r, grade, cls);

// 要素を非表示にする関数
function hiddenUnnecessaryData(tb_r, grade, cls) {
  for (var i = 1, len = tb_r.length; i < len; i++) {
    if (tb_r[i].cells[5].innerText.match(grade) == null || tb_r[i].cells[6].innerText.match(cls) == null) {
      tb_r[i].style.display = 'none';
    }
  }
}

// 学年をポップアップから取得したい。
function init_settings_value(){
    // うまい感じに初期化関数を作成する
    grade = 'B3';
    cls = '情報・知能';

    chrome.runtime.sendMessage({method: "getLocalStorage", key: "grade"}, function(response) {
        grade = response.data;
        console.log(response.data);
    });

    chrome.runtime.sendMessage({method: "getLocalStorage", key: "class"}, function(response) {
        cls = response.data;
        console.log(response.data);
    });

    console.log("grade : ", grade);
    console.log(" cls  : ", cls);

    // grade = '';
    // cls = '';
}
