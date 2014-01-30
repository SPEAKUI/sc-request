var config = require( "./config.json" ),
  q = require( "q" ),
  superagent = require( "superagent" ),
  Queue = require( "sc-queue" ),
  hasKey = require( "sc-haskey" ),
  guid = require( "sc-guid" ),
  merge = require( "sc-merge" ),
  is = require( "sc-is" ),
  useify = require( "sc-useify" ),
  queue;

var Request = function ( options ) {
  var self = this;

  options = merge( config, options );

  queue = new Queue( function ( task, callback ) {

    superagent( task.data.type, task.data.url )
      .send( task.data.data )
      .accept( "json" )
      .type( "json" )
      .end( function ( error, response ) {

        var hasBody = hasKey( response, "body", "object" ) || hasKey( response, "body", "array" ) ? response.body : null,
          responseText = hasKey( response, "text", "string" ) ? response.text.trim() : "",
          xhrStatusText = hasKey( response, "xhr.statusText", "string" ) ? response.xhr.statusText.trim() : "";

        if ( !error && response[ "ok" ] !== true ) {
          error = new Error( responseText || xhrStatusText || options.language.undefinedStatusMessage );
        }

        if ( !error && !hasBody && /^get$/i.test( task.data.type ) ) {
          error = new Error( options.language.malformedServerResponse );
        }

        // TODO: use middleware to include this functionality
        // 
        // if ( !error && /^post$/i.test( task.data.type ) ) {
        //   var locationString = hasKey( response, "header.location", "string" ) ? response.header.location : "",
        //     locationGuids = guid.match( locationString ),
        //     lastGuid = locationGuids[ locationGuids.length - 1 ],
        //     id = is.empty( lastGuid ) ? null : lastGuid;
        //   if ( !id ) {
        //     error = new Error( "While creating the entity the server did not return a valid Id" );
        //   } else {
        //     response.body = is.object( response[ "body" ] ) ? response.body : {};
        //     response.body.__id = id;
        //   }
        // }

        self.use.run( error, response, function ( middlewareErrors, middlewareResponse ) {

          callback( error || middlewareErrors, {
            defer: task.defer,
            response: middlewareResponse || response
          } );

        } );

      } );

  }, options.maxNumberOfConcurrentXhr );

};

Request.prototype.call = function ( obj, options ) {
  var defer = q.defer(),
    task = {
      data: obj,
      defer: defer
    };

  queue.push( task, function ( error, task ) {
    defer[ error ? "reject" : "resolve" ]( error || task.response.body );
  } );

  return defer.promise;
};

useify( Request );

exports = module.exports = function ( obj, options ) {

  var defer = q.defer(),
    request = new Request( options );

  request.call( obj, options ).then( defer.resolve ).fail( defer.reject );

  return defer.promise;
};

exports.use = Request.prototype.use;