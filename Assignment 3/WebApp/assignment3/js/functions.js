
$(document).ready(function() {
    nextPosX = 10;
    nextPosY = 10;

    initCanvas();

    // Override search event
    $('#search-form').submit(function(e) {
        console.log('form submitted');

        // Stop page-reload
        e.preventDefault();

        // Get input
        searchTerms = $('#search-form > div > input').val();

        // Set pageNumber to 1
        pageNumber = 1;

        loadPhotos(searchTerms);
    });
});

/********* Draggable implementation *********/
var draggedElement = null

// Add dragevent
function handleDragStart(e) {
    // Do stuff with source node for drag

    draggedElement = this;

    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    console.log(this);
    e.dataTransfer.setData('text/html', this);

}

function handleDragOver(e) {
    // e is the target
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.effectAllowed = 'move';

    return false;
}

function handleDragEnter(e) {
    // e is the target
    this.classList.add('over');
}

function handleDragLeave(e) {
    // e is the target
    this.classList.remove('over');
}

function handleDrop(e) {
    // e is the target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    if(draggedElement != this) {
        // Don't do anything if dropping element on same element (this = target)
        console.log(e);
        var targetElement = this;
        draggedElement = targetElement;
        targetElement = e.dataTransfer.getData('text/html');

        console.log('target' + targetElement);

        // Get the background image url.
        var bgUrl = $(draggedElement).css('background-image');
        bgUrl = bgUrl.replace('url(','').replace(')','');
        addImageToCanvas(bgUrl);
    }

    return false;
}

function handleDragEnd(e) {
    // e is the source element of the drag.
    var photos = document.querySelectorAll('.photo');

    [].forEach.call(photos, function (photo) {
        photo.classList.remove('over');
    });
}

function addDragDropHandlers(){
    // Select all photos and add drag 'n drop event handlers.
    console.log("Adding Handlers");
    $('.photo').each(function(i, photo) {
        console.log("adding handlers to : ");
        console.log(photo);
        photo.addEventListener('dragstart', handleDragStart, false);
        photo.addEventListener('dragenter', handleDragEnter, false);
        photo.addEventListener('dragover', handleDragOver, false); // Dragover is fired multiple times during a hover, dragenter is not.
        photo.addEventListener('dragleave', handleDragLeave, false);
        photo.addEventListener('drop', handleDrop, false);
        photo.addEventListener('dragend', handleDragEnd, false);
    });


    //var photos = document.getElementsByClassName("photo");
    ////var photos = document.querySelectorAll('.photo');
    //console.log("photos: ");
    //console.log(photos);
    //photos.each(function(photo) {
    //    console.log("photo");
    //    console.log(photo)
    //    photo.addEventListener('dragstart', handleDragStart, false);
    //    photo.addEventListener('dragenter', handleDragEnter, false);
    //    photo.addEventListener('dragover', handleDragOver, false); // Dragover is fired multiple times during a hover, dragenter is not.
    //    photo.addEventListener('dragleave', handleDragLeave, false);
    //    photo.addEventListener('drop', handleDrop, false);
    //    photo.addEventListener('dragend', handleDragEnd, false);
    //});
    //[].forEach.call(photos, function(photo) {
    //    console.log("photo");
    //    console.log(photo)
    //    photo.addEventListener('dragstart', handleDragStart, false);
    //    photo.addEventListener('dragenter', handleDragEnter, false);
    //    photo.addEventListener('dragover', handleDragOver, false); // Dragover is fired multiple times during a hover, dragenter is not.
    //    photo.addEventListener('dragleave', handleDragLeave, false);
    //    photo.addEventListener('drop', handleDrop, false);
    //    photo.addEventListener('dragend', handleDragEnd, false);
    //});
}




function loadPhotos(terms){
    console.log(terms);
    //for (var i = 0; i < 9; i++) {
    //    $('<div />').attr('id', 'photo-' + i).addClass('photo').attr('draggable', 'true').appendTo('#photo-container').wrap('<figure></figure>');
    //}

    // TODO: Get current page of "book"
    //$.getJSON('https://api.flickr.com/services/rest/?jsoncallback=?', {
    //    'method' : 'flickr.galleries.getPhotos',
    //    'api_key' : 'a3fabd055784a302a7d61d6502b75e6d',
    //    'gallery_id' : "6065-72157617483228192",
    //    'extras' : 'date_upload, owner_name',
    //    'per_page' : 5,
    //    'page' : 1,
    //    'format' : 'json'

    // Query flickr API for images fitting search term in json format.
    $.getJSON('https://api.flickr.com/services/rest/?jsoncallback=?', {
        'method': 'flickr.photos.search',
        'api_key': 'a3fabd055784a302a7d61d6502b75e6d',
        'tags': searchTerms,
        'page': pageNumber,
        'per_page': '9',
        'format': 'json'

    }, function(data) {
        // jQuery loop
        $.each(data.photos.photo, function(i, photo) {

            // Add a div for each photo and make them draggable.
            $('<div />').attr('id', 'photo-' + i).addClass('photo').attr('draggable', 'true').appendTo('#photo-container').wrap('<figure></figure>');


            var imgURL = 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_n.jpg';

            // Pre-cache image see http://perishablepress.com/a-way-to-preload-images-without-javascript-that-is-so-much-better/
            $('<img />').attr({'src': imgURL, 'data-image-num': i}).load(function() {
                var imageDataNum = $(this).attr('data-image-num');
                $('#photo-' + imageDataNum).css('background-image', 'url(' + imgURL + ')').removeClass('fade-out').addClass('fade-in');

            });

            // Get the parent figure element and append the figcaption
            var parentFigure = $('#photo-' + i).parent();
            $('<figcaption>' + photo.title.substring(0, 55) + '</figcaption>').appendTo(parentFigure);

        });

        addDragDropHandlers();
    });


}

function initCanvas(){
    var canvas = document.getElementById("photo-book");
    canvas.setAttribute('width', '500');

    // DOn't do anything yet, later add background image
    //window.onload = function() {
    //    var c=document.getElementById("photo-book");
    //    var ctx=c.getContext("2d");
    //    var img = new Image();
    //    img.onload = function(){
    //        console.log(img);
    //        ctx.drawImage(img, 0, 0);
    //    };
    //    img.src = "img/open-book.gif";
    //
    //};


}

function addImageToCanvas(imgSource){
    console.log("ADDING IMAGE TO CANVAS");
    console.log("IMG Source = " + imgSource);
    console.log("Next X = " + nextPosX);
    console.log("Next Y = " + nextPosY);

    var canvas = $('#photo-book').get(0);
    var ctx = canvas.getContext("2d");
    console.log(canvas);

    if(nextPosX > canvas.width / 2) {
        // Reset PosX and increment Y so pictures are added on the next line.
        nextPosX = 10;
        nextPosY = nextPosY + 100; //TODO: Update with image height
    }

    // Draw the image
    var img = new Image();
    img.onload = function(){
        console.log(img);
        ctx.drawImage(img, 0, 0, 250, 100);
    };
    img.src = imgSource;

    console.log("Next X after = " + nextPosX);
    console.log("Next Y after = " + nextPosY);
    console.log("ADDED IMAGE TO CANVAS");

}

