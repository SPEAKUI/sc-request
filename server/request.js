var express = require( 'express' ),
  _ = require( "underscore" ),
  app = express(),
  dummy = require( "../test/index.test.json" );

app.use( express.logger( "dev" ) );
app.use( express.json() );
app.use( express.urlencoded() );
app.use( express.methodOverride() );
app.use( app.router );
app.use( express.static( __dirname + "/../" ) );

app.get( "/api/dummy", function ( req, res ) {
  res.json( dummy );
} );

app.get( "/api/person", function ( req, res ) {
  res.json( _.findWhere( dummy.data.people, {
    name: req.param( "name" ),
    dob: req.param( "dob" )
  } ) );
} );

app.put( "/api/person", function ( req, res ) {
  res.json( _.findWhere( dummy.data.people, req.body ) );
} );

app.post( "/api/person", function ( req, res ) {
  res.json( _.findWhere( dummy.data.people, req.body ) );
} );

app.del( "/api/person/:id", function ( req, res ) {
  res.json( _.findWhere( dummy.data.people, {
    id: req.params.id
  } ) );
} );

app.get( "/api/malformed-server-reponse", function ( req, res ) {
  res.send( "bad" );
} );

app.post( "/api/mixed-body-querystring-data", function ( req, res ) {
  res.json( {
    body: req.body,
    query: {
      database: req.param( "database" ),
      language: req.param( "language" )
    }
  } );
} );

app.listen( 3000 );