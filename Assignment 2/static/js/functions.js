
// For the image grid: Switch between movie information upon hovering.
$(document).ready(function() {
    $(".movie-thumbnail").hover(function() {
        var movieClass = $(this).attr('class').split(/\s+/)[1];

        var movieList = $(".similar-movie-expanded");
        $.each( movieList, function(index, item){
            // Convert DOM elemet to jquery object
            var currentElement = $(item);
            // If the movie has the same class as the one we hovered above
            // Show it by remove hidden class
            if (currentElement.hasClass(movieClass)) {
                currentElement.removeClass("hidden");
            } else {
                // Make sure that all other elements are hidden.
                currentElement.addClass("hidden");
            }
        });
    });
});
