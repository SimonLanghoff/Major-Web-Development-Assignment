
$(document).ready(function() {
    nextPosX = 10;
    nextPosY = 10;
    nextBookPhotoId = 1;
    nextPhotoId = 0;

    pageNumber = 0;

    // init empty hashmap to store count for search term.
    searchHistory = {};

    currentPhotoBookId = null;

    createNewPhotoBook();

    // populate list with books in storage
    updateBookList();

    // Override search event
    $('#search-form').submit(function(e) {
        console.log('form submitted');

        // Stop page-reload
        e.preventDefault();

        searchTerms = $('#search-form > div > input').val();

        // Get input
        if(searchTerms in searchHistory) {
            // Increment count
            searchHistory[searchTerms] = searchHistory[searchTerms] + 1;
        } else {
            // Create element with count = 1
            searchHistory[searchTerms] = 1;
        }

        // Search flickr using the search terms in the search box
        loadPhotos(searchTerms);
    });

    // Override create button click
    $('#btn-create-book').click(function(e) {
        console.log('Creating Book');
        createNewPhotoBook();
    });


    // Override Save button click
    $('#btn-save-book').click(function(e) {
        console.log('Saving Book');
        savePhotoBook();
    });

    // Override Delete button click
    $('#btn-delete-book').click(function(e) {
        console.log('Deleting Book');
        deletePhotoBook(currentPhotoBookId);
    });

    //loadPhotoBook(0);
    // Add handlers so images can be removed from the book without getting images from flickr.
    addDragDropHandlers();
});

/********* Draggable implementation *********/
var draggedElement = null
var draggedParent = null;

// Add dragevent
function handleDragStart(e) {
    // Do stuff with source node for drag
    draggedElement = $(this);
    draggedParent = $(this).parent();

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this);

}

function handleDragOver(e) {
    // e is the target
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows drop.
    }

    e.dataTransfer.effectAllowed = 'move'; // Necessary. Allows drop.

    return false;
}

function handleDragEnter(e) {
    // e is the target
    $(this).addClass('over');
    $(this).addClass('hover');

}

function handleDragLeave(e) {
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
        //if($(this).attr('id') === 'photo-book-container'){
        if($(this).attr('id') === 'photo-book'){
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

    //$('#photo-book-container').get(0).addEventListener('dragover', handleDragOver, false);
    //$('#photo-book-container').get(0).addEventListener('dragenter', handleDragEnter, false);
    //$('#photo-book-container').get(0).addEventListener('drop', handleDrop, false);
    //$('#photo-book-container').get(0).addEventListener('dragleave', handleDragLeave, false);

    $('#photo-book').get(0).addEventListener('dragover', handleDragOver, false);
    $('#photo-book').get(0).addEventListener('dragenter', handleDragEnter, false);
    $('#photo-book').get(0).addEventListener('drop', handleDrop, false);
    $('#photo-book').get(0).addEventListener('dragleave', handleDragLeave, false);
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
        'page': searchHistory[searchTerms], // Get the current count for that specific search term.
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

function addPhotoToBook(photoElement){
    //console.log("ADDING IMAGE TO BOOK");
    //console.log("IMG Source = " + photoElement);
    //console.log("Next X = " + nextPosX);
    //console.log("Next Y = " + nextPosY);

    //var book = $('#photo-book-container').get(0);
    var book = $('#photo-book').get(0);

    console.log('photo element: ');
    console.log(photoElement);

    if(nextPosX > book.offsetWidth / 2) {
        // Reset PosX and increment Y so pictures are added on the next line.
        nextPosX = 10;
        nextPosY = nextPosY + 100; //TODO: Update with image height
    }

    // TODO: Check if photos on page === 4, then go to next page.
    // Add 1 to page count because element has not been added yet.
    var pictureCount = getPictureCountOnPage(pageNumber);
    if(pictureCount + 1 >= 4){
        // Anmiation and flip to next page.
    } else {
        $(photoElement).addClass("book-photo-" + (pictureCount + 1));
    }

    $(photoElement).attr("id", "book-photo-" + nextBookPhotoId);
    $(photoElement).addClass("in-book");

    $(photoElement).children().removeAttr('id');

    // TODO: do this in the right section depending on the page we are on.
    console.log($(book).children('section').children('div').append(photoElement));
    //$(book).children('section').children('div').append(photoElement);

    $(photoElement).remove(); // remove the photo from the origin container. // TODO: Consider moving before adding class earlier


    // Then add the element to the photo-book
    pageNumber = $('#pages').attr('page');
    console.log('page number: ' + pageNumber);
    $('#pages').children().eq(pageNumber).children().append(photoElement);


    nextBookPhotoId = nextBookPhotoId + 1;

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

    $(photoElement).remove(); // remove the photo from the origin container.

    $(container).append(photoElement);

    nextPhotoId = nextPhotoId + 1;
}

function savePhotoBook(){
    //localStorage.setItem(key, $('#photo-book-container').html());
    localStorage.setItem(key, $('#pages').html());

    // Update listings of saved books.
    updateBookList();
}

// Simply clears the photo container of any items.
function clearCurrentPhotoBook(){
    currentPhotoBookId = null;
    //$('#photo-book-container').children().remove();
    // Get all the children of the div element and remove it
    //$('#pages').children('section').children('div').children().remove();
    $('#pages').children().remove();
    //$('#pages').find('figure').remove(); // This will remove all sections, script might not work.

    // TODO: instead use find and remove all figures, but then I need to redo the load approach.
}

function deletePhotoBook(id){
    // remove and refresh.
    localStorage.removeItem(id);
    updateBookList();

    if(currentPhotoBookId === id){
        // We are removing the book that we are currently viewing
        clearCurrentPhotoBook();
    }
}

function loadPhotoBook(id){
    // Remove the currently displayed book and then add the one requested.
    clearCurrentPhotoBook();
    //$('#photo-book-container').append(localStorage.getItem(id));
    $('#pages').append(localStorage.getItem(id));

    currentPhotoBookId = id;
}

function updateBookList(){
    // Clear current list
    $('#dropdown-book-list').children().remove();

    if(localStorage.length <= 0){
        $('#dropdown-book-list').append('<li>' + 'No books stored :(' + '</li>');
        return;
    }

    // Add all saved books.
    for (var i = 0; i < localStorage.length; i++){
        key = localStorage.key(i);
        $('#dropdown-book-list').append('<li><a href="#">' + key + '</a></li>');
    }

    // Make sure that event listeners are added.
    // override book list dropdown link event
    $('#dropdown-book-list').children('li').click(function() {
        // Show the book that was linked to.
        loadPhotoBook($(this).children('a').text());
    });
}

function createNewPhotoBook(){
    // Remove the one that is already on the page.
    // TODO: need to rerun book script then or add correct attributes
    clearCurrentPhotoBook();
    //if(currentPhotoBookId != null){
    //  clearCurrentPhotoBook();
    //}

    // Create a unique id for the new book
    var key = 'photo-book-' + getRandomWholeNumber(0, 10000);

    while(localStorage.getItem(key)){
        console.log("Key already exists! Generating new key!");
        key = 'photo-book-' + getRandomWholeNumber(0, 10000);
    }

    //localStorage.setItem(key, $('#photo-book-container').html());
    localStorage.setItem(key, $('#pages').html());

    updateBookList();

    addPagesToBook(5);

    // Clear the previous running script
    clearInterval($('photo-book').attr('interval-id'));

    // Add the rendering process to the newly added pages.
    // This might be a resource hog, but right now it's the easiest way for me to dynamically add pages.
    $.getScript("js/pageflip.js", function(){
        console.log('running script again');
    });

    // Return the generated id for reference.
    return key;
}

function getRandomWholeNumber(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function getPictureCountOnPage(pageNumber){
    return $('#pages').children().eq(pageNumber).children('div').children().length;
}

// Add an empty page
// Cannot get function to work, need to reapply script after removing section elements. so for now just doing the simple approach.
function addPagesToBook(count){
    for(i = 0; i < count; i++){
        var zIndex = count - i;
        console.log('Adding Page');
        $('#pages').append("<section style=\"z-index: " +zIndex+ ";\"" +"><div></div></section>");
    }
}

