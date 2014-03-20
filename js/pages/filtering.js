/**
 * sorting page
 */

( function( window, $ ) {

'use strict';

var ID = window.ID;

ID.filtering = function() {

  // demo at the top
  ( function() {

    var $container = $('#filtering-demo .isotope').isotope({
      itemSelector: '.element-item',
      layoutMode: 'fitRows',
      transitionDuration: '0.6s'
    });

    var filterFns = {
      // show if number is greater than 50
      numberGreaterThan50: function() {
        var number = $(this).find('.number').text();
        return parseInt( number, 10 ) > 50;
      },
      // show if name ends with -ium
      ium: function() {
        var name = $(this).find('.name').text();
        return name.match( /ium$/ );
      }
    };

    var filterFnsDisplay = {
      numberGreaterThan50: "function() {\n  var number = $(this).find('.number').text();\n  return parseInt( number, 10 ) > 50;\n}",
      ium: 'function() {\n  var name = $(this).find(\'.name\').text();\n  return name.match( /ium$/ );\n}'
    };

    var $codeDisplay = $('#filtering-demo .code-display code');

    $('#filtering-demo .button-group').on( 'click', 'button', function() {
      var filterValue = $(this).attr('data-filter');
      var isoFilterValue = filterFns[ filterValue ] || filterValue;
      var displayFilterValue = filterFnsDisplay[ filterValue ] || filterValue;
      $container.isotope({ filter: isoFilterValue });
      $codeDisplay.displayIsotopeCode( 'filter', displayFilterValue );
    });

  })();

};

})( window, jQuery );
