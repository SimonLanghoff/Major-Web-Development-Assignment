var pTags = $( "#collapse-comments" );

//        TODO: Make borders appear on load or make sure that the class "in" is removed when on mobile versions
$( ".toggle-button" ).click(function() {
    console.log(pTags.parent());
    if ( pTags.parent().hasClass( "mobile-border" ) && pTags.hasClass("in") ) {
        pTags.unwrap();
    } else {
        pTags.wrap( "<div class=\"mobile-border visible-mobile\"></div>" );
    }
});

