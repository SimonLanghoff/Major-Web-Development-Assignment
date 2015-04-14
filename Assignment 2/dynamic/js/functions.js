// Function to toggle borders on the collapsible elements
jQuery(document).ready(function($) {
    $( ".toggle-button" ).click(function() {
        var pTags = $(this).next( "div.collapse" );
        console.log(pTags);
        if ( $(this).next().hasClass( "mobile-border" ) && !pTags.hasClass("collapsed")) {
            $(".wrapping-class").children().unwrap();
        } else {
            pTags.wrap( "<div class=\"mobile-border visible-mobile wrapping-class\"></div>" );
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

