var dragSourceElement;

$(document).ready(function(){
	drawTarget();
	createChequerboard();
});

// draw circles with a given radius
function drawCircle(radius, fillStyle, strokeStyle){
	var canvas = $("#target")[0];
	if(canvas.getContext){

		var context = canvas.getContext('2d');

		context.beginPath();
		context.strokeStyle = strokeStyle;
		context.fillStyle = fillStyle;
		context.lineWidth = 1;

		context.arc(225, 225, radius, 0, Math.PI*2);
		context.stroke();
		context.fill();
	}
}

function drawTarget(){
	drawCircle(225, 'rgba(0, 0, 0, 0)', 'rgba(68, 68, 68, 1)');
	drawCircle(220, 'rgba(0, 0, 0, 0)', 'rgba(68, 68, 68, 1)');
	drawCircle(150, 'rgba(0, 0, 0, 0)', 'rgba(68, 68, 68, 1)');
	drawCircle(145, 'rgba(0, 0, 0, 0)', 'rgba(68, 68, 68, 1)');
	drawCircle(75, 'rgba(0, 0, 0, 0)', 'rgba(68, 68, 68, 1)');
	drawCircle(70, 'rgba(102, 68, 74, 1)', 'rgba(68, 68, 68, 1)');
}

function createChequerboard(){
	var currentTileClass = 'chequerboard-tile-black';

	for(var leftoffset = 0; leftoffset < 245; leftoffset += 50){
		for(var topoffset = 0; topoffset < 245; topoffset += 50){
			$('<canvas width="45" height="45" />').addClass(currentTileClass).
			css({ 'left': leftoffset + 'px', 'top': topoffset + 'px' }).
			appendTo("#chequerboard");	

			if(currentTileClass == 'chequerboard-tile-black'){
				currentTileClass = 'chequerboard-tile-white';
			}
			else if(currentTileClass == 'chequerboard-tile-white'){
				currentTileClass = 'chequerboard-tile-black';
			}	
		}
	}


	$('.chequerboard-tile-black').each(function(){
		var context = this.getContext('2d');
		context.fillStyle = 'rgba(85, 85, 85, 1)';
		context.fillRect(0, 0, 45, 45);
	});

	$('.chequerboard-tile-white').each(function(){
		var context = this.getContext('2d');
		context.fillStyle = 'rgba(238, 238, 238, 1)';
		context.strokeStyle = 'rgba(170, 170, 170, 1)';
		context.fillRect(0, 0, 45, 45);
		context.strokeRect(0, 0, 45, 45);
	});

	$('.chequerboard-tile-white, .chequerboard-tile-black').addClass("draggable");

	$(".draggable").attr('draggable', 'true')
		.bind('dragstart', function(){
			dragSourceElement = this;
			$(this).css({
				'opacity': '0.5',
				'box-shadow': '0px 0px 5px rgba(0, 0, 0, 1)'
			});
		}).bind('dragend', function(){
			dragSourceElement = this;
			$(this).css({
				'opacity': '1',
				'box-shadow': 'none'
			});
		});

		
			var that = $('#target');
			that.bind('dragover', function(event){
				event.preventDefault();
			});
			that.bind('drop', function(event){
				event.preventDefault();
				$(dragSourceElement).hide();
				alert("Bullseye!");
			});
		

}
