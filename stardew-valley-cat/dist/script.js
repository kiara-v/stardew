$(".cat-wrap").click(function() {	
	const myBubble = 	$('.bubble-wrap')	
	const myAudio = $('.cat-meow');
	
	myAudio[0].play();

	if(myBubble.hasClass('animate')) {
		myBubble.removeClass('animate');
		 const el = myBubble, newBubble = el.clone(true);           
 		el.before(newBubble);        
 		$("." + el.attr("class") + ":last").remove();
			newBubble.addClass('animate');
	} else {
			myBubble.addClass('animate');
	}

});