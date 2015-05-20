// Display welcome modal.
$(window).load(function(){
    $('#modal-welcome').modal('show');
});

$(document).ready(function() {
    nextBookPhotoId = 1;
    nextPhotoId = 0;

    // init empty hashmap to store count for search terms.
    searchHistory = {};

    currentPhotoBookId = createNewPhotoBook();

    // populate list with books in storage
    updateBookList();

    // Override search event
    $('#search-form').submit(function(e) {
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
        currentPhotoBookId = createNewPhotoBook();
    });


    // Override Save button click
    $('#btn-save-book').click(function(e) {
        savePhotoBook(currentPhotoBookId);
    });

    // Override Delete button click
    $('#btn-delete-book').click(function(e) {
        deletePhotoBook(currentPhotoBookId);
    });


    $('#btn-delete-photos').click(function(e) {
        $('#photo-container').children().remove();
    });

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
    if($(this).attr('id') != 'photo-container') {
        $(this).addClass('hover');
    }
}

function handleDragLeave(e) {
    // e is the target
    // Only remove the class if we are outside the book or photo containers.
    if($(this).attr('id') === 'photo-container') {
        $('hover').removeClass('hover');
    }
}

function handleDrop(e) {
    // e is the target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    $('.hover').removeClass('hover');

    if(draggedElement != this) {
        if($(this).attr('id') === 'photo-book'){
            addPhotoToBook(draggedElement);
        } else if($(this).attr('id') === 'photo-container') {
            addPhotoToContainer(draggedElement);
        }
    }

    return false;
}

function handleDragEnd(e) {
    // e is the source element of the drag.
    $('.hover').removeClass('hover');
}

function addDragDropHandlers(){
    // Enable photos to be moved.
    $('.photo').parent().each(function(i, photo) {
        photo.addEventListener('dragstart', handleDragStart, false);
    });

    // Listen for events on photo book and photo-container.
    // TODO: right now the canvas handlers intercept the drag event, so cannot move images from book back to photo-container unfortunately.
    $('#photo-container').get(0).addEventListener('dragover', handleDragOver, false);
    $('#photo-container').get(0).addEventListener('dragenter', handleDragEnter, false);
    $('#photo-container').get(0).addEventListener('drop', handleDrop, false);
    $('#photo-container').get(0).addEventListener('dragleave', handleDragLeave, false);
    $('#photo-container').get(0).addEventListener('dragend', handleDragEnd, false);

    $('#photo-book').get(0).addEventListener('dragover', handleDragOver, false);
    $('#photo-book').get(0).addEventListener('dragenter', handleDragEnter, false);
    $('#photo-book').get(0).addEventListener('drop', handleDrop, false);
    $('#photo-book').get(0).addEventListener('dragleave', handleDragLeave, false);
}

// Used the example from the lectures as example to fetch images and preload them.
function loadPhotos(terms){
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

                // Get the random x/y coordinates, subtract size of image from max value to prevent out of bounds.
                setRandomPosition($('#photo-' + imageDataNum).parent('figure'));

                $('#photo-' + imageDataNum).css('background-image', 'url(' + imgURL + ')').removeClass('fade-out').addClass('fade-in');
            });

            // Get the parent figure element and append the figcaption
            var parentFigure = $('#photo-' + nextPhotoId).parent();
            $('<figcaption>' + photo.title.substring(0, 65) + '</figcaption>').appendTo(parentFigure);

            nextPhotoId = nextPhotoId + 1;
        });

        addDragDropHandlers();
    });
}

function addPhotoToBook(photoElement){
    var book = $('#photo-book').get(0);
    var pageNo = getCurrentPageNumber();
    var pictureCount = getPictureCountOnPage(pageNo);

    if(pictureCount < 4){
        $(photoElement).attr("id", "book-photo-" + nextBookPhotoId);
        $(photoElement).addClass("in-book");
        $(photoElement).children().removeAttr('id');
        $(photoElement).css('top', "").css('left', "");

        $(photoElement).remove(); // remove the photo from the origin container.

        //// Add the element to the photo-book on the current page
        $('#pages').children().eq(pageNo).children().append(photoElement);

        nextBookPhotoId = nextBookPhotoId + 1;

        // Add 1 to page count because element has not been added yet.
        $(photoElement).addClass("book-section-" + (pictureCount + 1));
    } else {
        // TODO Future work: Animation and flip to next page (or just don't add anything).
    }
}

function addPhotoToContainer(photoElement){
    var container = $('#photo-container').get(0);

    $(photoElement).children('div').attr('id', "photo-" + nextPhotoId);

    $(photoElement).removeClass("in-book");
    $(photoElement).removeAttr('id');

    $(photoElement).remove(); // remove the photo from the origin container.

    setRandomPosition(photoElement);
    $(container).append(photoElement);

    nextPhotoId = nextPhotoId + 1;
}

// used to determine a random position within the photo-container and add that style to the supplied photo element.
function setRandomPosition(element){
    var maxX = $('#photo-container').innerWidth() - 300;
    var positionX = getRandomWholeNumber(0, maxX);

    var maxY = $('#photo-container').innerHeight() - 300;
    var positionY = getRandomWholeNumber(0, maxY);

    $(element).css({left: positionX, top: positionY});
}

function savePhotoBook(key){
    localStorage.setItem(key, $('#pages').html());

    // Update listings of saved books.
    updateBookList();
}

// Simply clears the photo container of any items and go back to first page.
function clearCurrentPhotoBook(){
    currentPhotoBookId = null;
    $('#pages').children().remove();
    setCurrentPageNumber(0);
}

function deletePhotoBook(id){
    // remove and refresh.
    localStorage.removeItem(id);
    updateBookList();

    if(currentPhotoBookId === id){
        // We are removing the book that we are currently viewing
        clearCurrentPhotoBook();
    }

    currentPhotoBookId = createNewPhotoBook();
}

function loadPhotoBook(id){
    // Remove the currently displayed book and then add the one requested.
    clearCurrentPhotoBook();
    //$('#photo-book-container').append(localStorage.getItem(id));
    $('#pages').append(localStorage.getItem(id));

    currentPhotoBookId = id;

    // Indicate that we need to start from page 0.
    resetBookScript(true);
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
        var key = localStorage.key(i);
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
    clearCurrentPhotoBook();

    // Create a unique id for the new book
    var key = 'photo-book-' + getRandomWholeNumber(0, 10000);

    while(localStorage.getItem(key)){
        console.log("Key already exists! Generating new key!");
        key = 'photo-book-' + getRandomWholeNumber(0, 10000);
    }

    // Add pages to the book and updates the renderer script
    addPagesToBook(20);

    resetBookScript(true);

    // Return the generated id for reference.
    return key;
}

function getRandomWholeNumber(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function getPictureCountOnPage(pageNumber){
    return $('#pages').children().eq(pageNumber).children('div').children().length;
}

function getCurrentPageNumber(){
    return $('#pages').attr('page');
}

function setCurrentPageNumber(value){
    $('#pages').attr('page', value);
}

// Add an empty page
// Cannot get function to work, need to reapply script after removing section elements. so for now just doing the simple approach.
function addPagesToBook(count){
    for(i = 0; i < count; i++){
        var zIndex = count - i;
        $('#pages').append("<section style=\"z-index: " +zIndex+ ";\"" +"><div></div></section>");
    }
}

function resetBookScript(shouldStartOver){
    if(shouldStartOver){
        page = 0;
        flips = [];

        // We also need to reset all the page animations and start start from page 0
        $('#pages').children('section').css("width", "860");
    }

    var book = $('#photo-book');

    // List of all the page elements in the DOM
    pages = $('#pages').children();


    // Organize the depth of our pages and create the flip definitions
    for( var i = 0, len = pages.length; i < len; i++ ) {
        pages[i].style.zIndex = len - i;

        flips.push( {
            // Current progress of the flip (left -1 to right +1)
            progress: 1,
            // The target value towards which progress is always moving
            target: 1,
            // The page DOM element related to this flip
            page: pages[i],
            // True while the page is being dragged
            dragging: false
        } );
    }

    // This is not used anymore since i now use globally referenced variables.
    //// Clear the previous running script
    //clearInterval($('photo-book').attr('interval-id'));
    //
    //// Add the rendering process to the newly added pages.
    //// This might be a resource hog, but right now it's the easiest way for me to dynamically add pages.
    //$.getScript("js/photobook.js", function(){
    //    console.log('running script again');
    //});
}
