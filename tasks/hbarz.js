var path = require('path');
var handlebars = require('handlebars');
var marked = require('marked');

var highlight = require('./utils/highlight');
var parseJSONFrontMatter = require('./utils/parse-json-front-matter');

// --------------------------  -------------------------- //

function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function getFilename( filepath ) {
  return path.basename( filepath, path.extname( filepath ) );
}

// -------------------------- Handlebar Helpers -------------------------- //

// https://gist.github.com/meddulla/2571518
handlebars.registerHelper( 'if_equal', function( a, b, options ) {
  if ( a == b ) {
    return options.fn( this );
  }
});

handlebars.registerHelper( 'slug', function( str ) {
  return str.replace( /[?]/, '' ).replace( /[\., ]+/gi, '-' ).toLowerCase();
});

// --------------------------  -------------------------- //

module.exports = function( grunt ) {

  grunt.registerMultiTask( 'hbarz', 'Process Handlebars templates', function() {
    var opts = this.options();

    // register all templates with Handlebars
    var templateFiles = grunt.file.expand( opts.templates );
    // hash of Handlebar templates
    var templates = {};
    templateFiles.forEach( function( filepath ) {
      var name = getFilename( filepath );
      var src = grunt.file.read( filepath );
      templates[ name ] = handlebars.compile( src );
      // register all as partials
      handlebars.registerPartial( name, src );
    });

    // get data
    var data = {};
    var dataFiles = grunt.file.expand( opts.dataFiles );
    dataFiles.forEach( function( filepath ) {
      var name = getFilename( filepath );
      data[ name ] = grunt.file.readJSON( filepath );
    });

    // read isotope's contributing file, convert to HTML
    var submittingIssuesContent = marked( grunt.file.read('bower_components/isotope/CONTRIBUTING.mdown') );
    handlebars.registerPartial( 'submitting-issues', submittingIssuesContent );

    // properties made available for templating
    var site = {};
    site.css = grunt.file.expand( grunt.config.get('concat.css.src') );
    site.js = grunt.file.expand( grunt.config.get('concat.js.src') );
    // data used across site
    var siteContext = {
      site: site,
      isDev: grunt.option('dev')
    };
    // add data
    siteContext = expand( siteContext, data );

    this.files.forEach( function( file ) {
      file.src.forEach( function( filepath ) {
        // first process page source
        var src = grunt.file.read( filepath );
        var parsed = parseJSONFrontMatter( src );
        src = parsed.src;
        var pageJson = parsed.json || {};
        // data used on page
        var context = {
          basename: path.basename( filepath, path.extname( filepath ) ),
          page: pageJson
        };
        context = extend( context, siteContext );
        // compile it
        src = handlebars.compile( src )( context );
        // process source into page template
        var splitPath = filepath.split( path.sep );
        // remove leading directory
        if ( splitPath.length > 1 ) {
          splitPath.splice( 0, 1 );
        }
        src = highlight( src );
        context.content = src;
        var templated = templates[ opts.defaultTemplate ]( context );
        var dest = file.dest + splitPath.join( path.sep );
        grunt.file.write( dest, templated );
      });
    });
  });

};
