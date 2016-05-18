$(function(){
    // 参考: http://d.hatena.ne.jp/yk5656/20141011/1414984933

    // saveボタンの処理
    $("#save").click(function (){
        localStorage["grade"] = $("#select_grade").val();
        localStorage["class"] = $("#select_class").val();
    });

    // ローカルストレージに設定されている値を設定
    if (localStorage["grade"]){
        var my_grade = localStorage["grade"];
        $("#select_grade option[value=" + my_grade + "]").attr("selected", true);
    }
    if (localStorage["class"]) {
        var my_class = localStorage["class"];
        $("#select_class option[value=" + my_class + "]").attr("selected", true);
    }
});
