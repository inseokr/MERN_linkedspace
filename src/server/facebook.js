var https = require('https');

exports.getFbData = function(accessToken, apiPath, listOfFields, callback) {
    var fields_string = (listOfFields.length==0) ? ``: `fields=${listOfFields}&`;

    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: apiPath + `?${fields_string}access_token=` + accessToken, //apiPath example: '/me/friends'
        method: 'GET'
    };

    var buffer = ''; //this buffer will be populated with the chunks of the data received from facebook
    var request = https.get(options, function(result){
        result.setEncoding('utf8');
        result.on('data', function(chunk){
            buffer += chunk;
        });

        result.on('end', function(){
            callback(JSON.parse(buffer));
        });
    });

    request.on('error', function(e){
        console.log('error from facebook.getFbData: ' + e.message)
    });

    request.end();
}