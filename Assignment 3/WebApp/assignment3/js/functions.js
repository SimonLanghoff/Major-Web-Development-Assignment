
$(document).ready(function() {
    nextPosX = 10;
    nextPosY = 10;
    nextPhotoBookId = 1;
    nextPhotoId = 0;
    currentBookId = 1;

    //initCanvas();

    // populate list with books in storage
    getAllBooksInStorage();

    // override book list dropdown link event
    $('#dropdown-book-list').children('li').click(function() {
        console.log('clicked on saved book');
        loadPhotoBook($(this).children('a').text());
    });



    // Override search event
    $('#search-form').submit(function(e) {
        console.log('form submitted');

        // Clear all previous search results


        // Stop page-reload
        e.preventDefault();

        // Get input
        searchTerms = $('#search-form > div > input').val();

        // Set pageNumber to 1
        pageNumber = 1;

        loadPhotos(searchTerms);
    });

    // Override Save button click
    $('#btn-save-book').click(function(e) {
        console.log('Saving Book');
        savePhotoBook();
    });

    // Override Delete button click
    $('#btn-delete-book').click(function(e) {
        console.log('Deleting Book');
        deletePhotoBook(currentBookId);

        localStorage.clear();
    });

    loadPhotoBook(0);
    // Add handlers so images can be removed from the book without getting images from flickr.
    addDragDropHandlers();
});

/********* Draggable implementation *********/
var draggedElement = null
var draggedParent = null;

// Add dragevent
function handleDragStart(e) {
    console.log('dragstart');
    // Do stuff with source node for drag
    draggedElement = $(this);
    draggedParent = $(this).parent();

    console.log('drag started');
    console.log($(draggedElement).attr('id'));
    console.log($(draggedParent).attr('id'));


    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this);

}

function handleDragOver(e) {
    console.log('dragover');
    // e is the target
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows drop.
    }

    e.dataTransfer.effectAllowed = 'move'; // Necessary. Allows drop.

    return false;
}

function handleDragEnter(e) {
    console.log('dragenter');
    // e is the target
    //if($(draggedElement).attr('id') === $(draggedParent).attr('id')){
    //    console.log('test');
    //} else {
    //    console.log($(draggedElement).attr('id'));
    //    console.log($(draggedParent).attr('id'));
    //    $(this).addClass('over');
    //    $(this).addClass('hover');
    //}

    $(this).addClass('over');
    $(this).addClass('hover');

}

function handleDragLeave(e) {
    console.log('dragleave');
    console.log($(this).attr('id'));
    // e is the target
    // Only remove the class if we are outside the book or photo containers.

    if($(this).attr('id') === 'photo-book-container') {

    } else if($(this).attr('id') == 'photo-container') {

    } else {
        $('.over').removeClass('over')
        $('hover').removeClass('hover')
    }



}

function handleDrop(e) {
    console.log('Dropping');

    console.log($(this).attr('id'));
    // e is the target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    //$('#photo-book-container').removeClass('over');
    //$('#photo-book-container').removeClass('hover');
    $('.over').removeClass('over');
    $('.hover').removeClass('hover');



    if(draggedElement != this) {
        //Don't do anything if dropping element on same element (this = target)
        if($(this).attr('id') === 'photo-book-container'){
            console.log('Dropping on book');
            addPhotoToBook(draggedElement);
        } else if($(this).attr('id') === 'photo-container') {
            console.log('Dropping on container');
            addPhotoToContainer(draggedElement);
        }
    }

    return false;
}

function handleDragEnd(e) {
    console.log('dragend');
    // e is the source element of the drag.
    $('.over').removeClass('over');
    $('.hover').removeClass('hover');
}

function addDragDropHandlers(){
    // Select all photos and add drag 'n drop event handlers.
    console.log("Adding Handlers");
    $('.photo').parent().each(function(i, photo) {
        photo.addEventListener('dragstart', handleDragStart, false);
        //photo.addEventListener('dragenter', handleDragEnter, false);
        //photo.addEventListener('dragover', handleDragOver, false); // Dragover is fired multiple times during a hover, dragenter is not.
        //photo.addEventListener('dragleave', handleDragLeave, false);
        //photo.addEventListener('drop', handleDrop, false);
        //photo.addEventListener('dragend', handleDragEnd, false);
    });


    $('#photo-container').get(0).addEventListener('dragover', handleDragOver, false);
    $('#photo-container').get(0).addEventListener('dragenter', handleDragEnter, false);
    $('#photo-container').get(0).addEventListener('drop', handleDrop, false);
    $('#photo-container').get(0).addEventListener('dragleave', handleDragLeave, false);
    $('#photo-container').get(0).addEventListener('dragend', handleDragEnd, false);


    //$('#content').get(0).addEventListener('dragenter', handleDragEnter, false);


    $('#photo-book-container').get(0).addEventListener('dragover', handleDragOver, false);
    $('#photo-book-container').get(0).addEventListener('dragenter', handleDragEnter, false);
    $('#photo-book-container').get(0).addEventListener('drop', handleDrop, false);
    $('#photo-book-container').get(0).addEventListener('dragleave', handleDragLeave, false);



}




function loadPhotos(terms){
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
            $('<div />').attr('id', 'photo-' + nextPhotoId).addClass('photo').attr('draggable', 'true').appendTo('#photo-container').wrap('<figure></figure>');

            var imgURL = 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_n.jpg';

            // Pre-cache image see http://perishablepress.com/a-way-to-preload-images-without-javascript-that-is-so-much-better/
            $('<img />').attr({'src': imgURL, 'data-image-num': nextPhotoId}).load(function() {
                var imageDataNum = $(this).attr('data-image-num');
                $('#photo-' + imageDataNum).css('background-image', 'url(' + imgURL + ')').removeClass('fade-out').addClass('fade-in');

            });

            // Get the parent figure element and append the figcaption
            var parentFigure = $('#photo-' + nextPhotoId).parent();
            $('<figcaption>' + photo.title.substring(0, 55) + '</figcaption>').appendTo(parentFigure);

            nextPhotoId = nextPhotoId + 1;

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

function addPhotoToBook(photoElement){
    //console.log("ADDING IMAGE TO BOOK");
    //console.log("IMG Source = " + photoElement);
    //console.log("Next X = " + nextPosX);
    //console.log("Next Y = " + nextPosY);

    var book = $('#photo-book-container').get(0);

    console.log(photoElement);

    if(nextPosX > book.offsetWidth / 2) {
        // Reset PosX and increment Y so pictures are added on the next line.
        nextPosX = 10;
        nextPosY = nextPosY + 100; //TODO: Update with image height
    }

    $(photoElement).attr("id", "book-photo-" + nextPhotoBookId);
    $(photoElement).addClass("in-book");

    $(photoElement).children().removeAttr('id');

    $(book).append(photoElement);


    nextPhotoBookId = nextPhotoBookId + 1;

    //
    //console.log("Next X after = " + nextPosX);
    //console.log("Next Y after = " + nextPosY);
    //console.log("ADDED IMAGE TO BOOK");

}

function addPhotoToContainer(photoElement){
    console.log("ADDING IMAGE TO Container");
    console.log("IMG Source = " + photoElement);

    var container = $('#photo-container').get(0);

    $(photoElement).children('div').attr('id', "photo-" + nextPhotoId);

    $(photoElement).removeClass("in-book");
    $(photoElement).removeAttr('id');

    $(photoElement).remove();

    $(container).append(photoElement);

    nextPhotoId = nextPhotoId + 1;

}

function savePhotoBook(){
    localStorage.setItem('photo-book-' + (currentBookId), $('#photo-book-container').html());
}

function deletePhotoBook(id){
    localStorage.removeItem('photo-book-' + id);
}

function loadPhotoBook(id){
    // Remove the currently displayed book and then add the one requested.
    $('#photo-book-container').children().remove();
    $('#photo-book-container').append(localStorage.getItem(id));
}

function getAllBooksInStorage(){
    for (var i = 0; i < localStorage.length; i++){
        key = localStorage.key(i);
        console.log(localStorage.getItem(localStorage.key(i)));

        $('#dropdown-book-list').append('<li><a href="#">' + key + '</a></li>');
    }
}

