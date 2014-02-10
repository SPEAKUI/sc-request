var should = require( "should" ),
  dummy = require( "./index.test.json" ),
  request = require( ".." );

describe( "request", function () {

  /* TODO: write more tests */

  it( "should integrate middleware", function ( done ) {

    request.use( "postRequest", function ( _error, _response, _next ) {

      _response.body.hash = "brown";
      _next( _error, _response );

    } );

    request.use( "postRequest", function ( _error, _response, _next ) {

      _response.body.chicken = "tasty";
      _next( _error, _response );

    } );

    request( {

      type: "get",
      url: "http://localhost:3000/api/person",
      data: dummy.data.people[ 0 ]

    } ).then( function ( res ) {

      res.name.should.equal( dummy.data.people[ 0 ].name );
      res.hash.should.equal( "brown" );
      res.chicken.should.equal( "tasty" );

      done();

    } ).fail( done );

  } );

} );