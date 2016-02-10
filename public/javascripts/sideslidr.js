$(function(){
  // Collapseイベント
  $('#category, #menuTwo')
  .on('show.bs.collapse', function() { //< 折り畳み開く処理
  $('a[href="#' + this.id + '"]').find('span.glyphicon-chevron-down')
  .removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
  })
  .on('hide.bs.collapse', function() { //< 折り畳み閉じる処理
  $('a[href="#' + this.id + '"]').find('span.glyphicon-chevron-up')
  .removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
  });
  // ハッシュリンクキャンセル
  $('a[href="#category"], a[href="#menuTwo"]').on('click', function(event) {
  event.preventDefault();
  });
});
  
$(function() {
  $(document).ready(function() {
  $('.slide-menu').sidr({
  name: 'sidr-menu',
  side : 'left'
  });
  });
    
})
