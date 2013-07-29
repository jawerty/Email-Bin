function hoverOver(t) {
	t.style.background = '#F38630'
	t.style.color = '#ffffff'
	t.style.border = '1px solid #FA6900'
	t.style.borderRadius = '1px'
}

function hoverOut(t) {
	t.style.background = ''
	t.style.color = '#666666'
	t.style.border = ''
	t.style.borderRadius = ''
}

function onClick(t) {
	num = $(t).attr('id')[$(t).attr('id').length -1];
	body = $("#body_div_cover"+num);
	if (typeof show == "undefined") {
		body.slideToggle();
		show = true
	} else {
		body.slideToggle();
		delete show
	}
}

function toggleCompose() {
	$("#compose").slideToggle();
}