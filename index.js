var q = require( "q" ),
  request = require( "superagent" ),
  Queue = require( "sc-queue" ),
  hasKey = require( "sc-haskey" ),
  guid = require( "sc-guid" ),
  merge = require( "sc-merge" ),
  is = require( "sc-is" ),
  type = require( "type-component" ),
  defaults,
  queue;

defaults = {
  maxNumberOfConcurrentXhr: 5
}

var initQueue = function ( options ) {

  options = merge( defaults, options );

  queue = new Queue( function ( task, callback ) {

    request( task.data.type, task.data.url )
      .send( task.data.data )
      .set( "Accept", "application/json" )
      .set( "Content-Type", "application/json" )
      .end( function ( error, response ) {

        var hasBody = hasKey( response, "body", "object" ) || hasKey( response, "body", "array" ) ? response.body : null,
          responseText = hasKey( response, "text", "string" ) ? response.text.trim() : "",
          xhrStatusText = hasKey( response, "xhr.statusText", "string" ) ? response.xhr.statusText.trim() : "",
          defaultResponseText = "The server returned an undefined status message";

        if ( !error && response[ "ok" ] !== true ) {
          error = new Error( responseText || xhrStatusText || defaultResponseText );
        }

        if ( !error && !hasBody && /^get$/i.test( task.data.type ) ) {
          error = new Error( "Malformed server response. Expected a JSON object but got plain text" );
        }

        if ( !error && /^post$/i.test( task.data.type ) ) {

          var locationString = hasKey( response, "header.location", "string" ) ? response.header.location : "",
            locationGuids = guid.match( locationString ),
            lastGuid = locationGuids[ locationGuids.length - 1 ],
            id = is.empty( lastGuid ) ? null : lastGuid;

          if ( !id ) {
            error = new Error( "While creating the entity the server did not return a valid Id" );
          } else {
            response.body = type( response[ "body" ] ) === "object" ? response.body : {};
            response.body.__id = id;
          }

        }

        callback( error, {
          defer: task.defer,
          response: response
        } );

      } );

  }, config.maxNumberOfConcurrentXhr );

};

/**
 * Create an ajax request and return a promise Object
 *
 * @method ajaxRequest
 * @param {Object} has a data, url and type (GET|PUT|POST|DELETE|OPTIONS})
 * @return {Object} a promise Object
 */
var ajaxRequest = function ( obj, options ) {
  var defer = q.defer(),
    task = {
      data: obj,
      defer: defer
    };

  if ( !queue ) {
    initQueue( options );
  }

  queue.push( task, function ( error, task ) {
    defer[ error ? "reject" : "resolve" ]( error || task.response.body );
  } );

  return defer.promise;
};

module.exports = ajaxRequest;