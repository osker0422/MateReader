$(function dropdownMenu(){
    $('.dropdown-menu a').click(function(){
    //反映先の要素名を取得
    var visibleTag = $(this).parents('ul').attr('visibleTag');
    var hiddenTag = $(this).parents('ul').attr('hiddenTag');
    //選択された内容でボタンの表示を変える
    $(visibleTag).html($(this).attr('value'));
    //選択された内容でhidden項目の値を変える
    $(hiddenTag).val($(this).attr('value'));
    })
})