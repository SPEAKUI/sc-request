var express = require( 'express' ),
  app = express(),
  dummy = require( "../test/index.test.json" );

app.use( express.json() );
app.use( express.urlencoded() );
app.use( express.logger( "dev" ) );

app.get( '/api/person', function ( req, res ) {
  res.json( dummy.data.people[ 0 ] );
} );

app.listen( 3000 );