var dummy,
  request = screquest;

describe( "request", function () {

  /* TODO: write more tests */

  it( "should load the dummy data", function ( _done ) {

    request( {
      type: "get",
      url: "http://localhost:3000/api/dummy"
    } ).then( function ( res ) {

      dummy = res;
      _done();

    } ).fail( _done );

  } );

  it( "should get", function ( _done ) {

    request( {
      type: "get",
      url: "http://localhost:3000/api/person",
      data: dummy.data.people[ 0 ]
    } ).then( function ( person ) {

      person.should.have.a.property( "name", dummy.data.people[ 0 ].name );
      person.should.have.a.property( "dob", dummy.data.people[ 0 ].dob );
      _done();

    } ).fail( _done );

  } );

  it( "should put", function ( _done ) {

    request( {
      type: "put",
      url: "http://localhost:3000/api/person",
      data: dummy.data.people[ 1 ]
    } ).then( function ( person ) {

      person.should.have.a.property( "name", dummy.data.people[ 1 ].name );
      person.should.have.a.property( "dob", dummy.data.people[ 1 ].dob );
      _done();

    } ).fail( _done );

  } );

  it( "should post", function ( _done ) {

    request( {
      type: "post",
      url: "http://localhost:3000/api/person",
      data: dummy.data.people[ 2 ]
    } ).then( function ( person ) {

      person.should.have.a.property( "name", dummy.data.people[ 2 ].name );
      person.should.have.a.property( "dob", dummy.data.people[ 2 ].dob );
      _done();

    } ).fail( _done );

  } );

  it( "should delete", function ( _done ) {

    request( {
      type: "delete",
      url: "http://localhost:3000/api/person/4"
    } ).then( function ( person ) {

      person.should.have.a.property( "name", dummy.data.people[ 3 ].name );
      person.should.have.a.property( "dob", dummy.data.people[ 3 ].dob );
      _done();

    } ).fail( _done );

  } );

  it( "should integrate middleware", function ( _done ) {

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
      data: dummy.data.people[ 2 ]

    } ).then( function ( res ) {

      res.name.should.equal( dummy.data.people[ 2 ].name );
      res.hash.should.equal( "brown" );
      res.chicken.should.equal( "tasty" );
      request.useify.clear( "postRequest" );

      _done();

    } ).fail( _done );

  } );

  it( "should handle a malformed server response", function ( _done ) {

    request( {
      type: "get",
      url: "http://localhost:3000/api/malformed-server-reponse"
    } ).then( function ( wat ) {

      _done( new Error( "A malfored server response should fail" ) );

    } ).fail( function ( error ) {

      error.should.be.an.Error;
      _done();

    } );

  } );

  it( "should request with a mix of querying string and body data", function ( _done ) {

    request( {
      type: "post",
      url: "http://localhost:3000/api/mixed-body-querystring-data",
      data: {
        name: "david",
        age: 30
      },
      query: {
        database: "master",
        language: "en"
      },
      header: {
        "x-request": "value"
      }
    } ).then( function ( res ) {

      res.body.name.should.eql( "david" );
      res.body.age.should.eql( 30 );
      res.query.database.should.eql( "master" );
      res.query.language.should.eql( "en" );

      _done();

    } ).fail( _done );

  } );

} );