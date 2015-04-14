// Function to toggle borders on the collapsible elements
jQuery(document).ready(function($) {
    $( ".toggle-button" ).click(function() {
        var wrappedClass = $(this).next( "div.collapse" );
        // Is the sibling a border? And is it not collapsed? That means we are collapsing content that is wrapped in a border and we need to unwrap
        if ( $(this).next().hasClass( "mobile-border" ) && !wrappedClass.hasClass("collapsed")) {
            // Unwrap the border
            $(this).next().children().unwrap();
        } else if (!wrappedClass.hasClass("in")){
            // Only wrap content in a border if we are "opening" a container.
            wrappedClass.wrap( "<div class=\"mobile-border visible-mobile wrapping-class\"></div>" );
        }
    });
});

// Make the nav bar toggable.
jQuery(document).ready(function($) {
    $("#mobile-menu-button").click(function () {
        $("#mobile-nav-bar").toggleClass("hidden");
    });
});


// Handle changes between mobile and desktop version. (We need to remove mobile headers when resizing the window
// and we need to collapse information when we are on mobile.
$(document).ready(function() {
    // use this formula to calculate the width correctly, otherwise it does not sync with the CSS media queries.
    var width = Math.max( $(window).width(), window.innerWidth);
    if (width < 960) {
        //    We are on mobile, so remove bootstrap class "in" which shows collapsible elements.
        $("div.collapse").removeClass("in");
    } else {
        $("div.collapse").addClass("in");
    }

    // Keep track of width to only trigger changes when we go from mobile to desktop or vice versa.
    var previousWidth = width;

    $(window).resize(function() {
        // use this formula to calculate the width correctly, otherwise it does not sync with the CSS media queries.
        var currentWidth = Math.max( $(window).width(), window.innerWidth);

        if(previousWidth < 960 && currentWidth > 960){
            console.log("moved to desktop from mobile")
            // Remove the wrapping border if any
            $(".wrapping-class").children().unwrap();
            $("div.collapse").addClass("in");
        }

        if(previousWidth > 960 && currentWidth < 960){
            console.log("moved to mobile from desktop")
            $("div.collapse").removeClass("in");
        }

        previousWidth = currentWidth;
    });
});

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
