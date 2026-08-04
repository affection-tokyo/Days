$(function(){
	var slideSpeed = 300,
	fadeSpeed = 500;

	function menuSet(){
		$('body').prepend('<div id="menuOverlay"></div>');
		$('#wrap').prepend('<div id="switchBtnArea"><a href="javascript:void(0);" id="switchBtn"><span></span><span></span><span></span></a></div>');

		var menuOverlay = $('#menuOverlay'),
		switchBtn = $('#switchBtn'),
		btnLeft = parseInt(switchBtn.css('right')),
		menuWrap = $('#menu'),
		menuWidth = menuWrap.outerWidth();

		switchBtn.on('click', function(){
			if($(this).hasClass('btnClose')){
				$(this).removeClass('btnClose').removeAttr('style');
				menuOverlay.stop().animate({opacity:'0'},fadeSpeed,function(){
					menuOverlay.removeAttr('style');
				});
				menuWrap.stop().animate({right:'-' + menuWidth + 'px'},slideSpeed);
				$('body').removeAttr('style');
			} else {
				$(this).addClass('btnClose').stop().animate({right:'10px' + btnLeft},slideSpeed);
				menuOverlay.css({display:'block',opacity:'0'}).stop().animate({opacity:'1'},fadeSpeed);
				menuWrap.stop().animate({right:'0'},slideSpeed);
			}
		});
		menuOverlay.on('click', function(){
			if(switchBtn.hasClass('btnClose')){
				switchBtn.removeClass('btnClose').removeAttr('style');
				menuOverlay.stop().animate({opacity:'0'},fadeSpeed,function(){
					menuOverlay.removeAttr('style');
				});
				menuWrap.stop().animate({right:'-' + menuWidth + 'px'},slideSpeed);
				$('body').removeAttr('style');
			}
		});
		menuWrap.on('click', function(){
			if(switchBtn.hasClass('btnClose')){
				switchBtn.removeClass('btnClose').removeAttr('style');
				menuOverlay.stop().animate({opacity:'0'},fadeSpeed,function(){
					menuOverlay.removeAttr('style');
				});
				menuWrap.stop().animate({right:'-' + menuWidth + 'px'},slideSpeed);
				$('body').removeAttr('style');
			}
		});
	}

	menuSet();
});