/*
    home-monitor-service-log-temp
    author: chris wininger
    description: a simple function for aws lambda that logs temperatures to
        a dynamo db database
*/

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1'})
const uuidv4 = require('uuid/v4')

exports.handler = (event, context, complete) => {
    // collect data
    const id = uuidv4()
    const timestamp = Date.now()
    const temperature = (event.queryStringParameters &&
        event.queryStringParameters.temperature)
    const temp_read_time = (event.queryStringParameters &&
        event.queryStringParameters.time_received)

    // === helpers ===
    const resp = (statusCode, body) => {
        complete(null, {
            statusCode,
            headers: {},
            body: JSON.stringify(body),
            isBase64Encoded: false
        })
    }
    // ===============

    if (!temperature) {
        // invalid input from client
        return resp(400, { 
                error: 'a temperature value must be supplied on the queryString'
            })
    }

  
    const Item = {
        id,
        timestamp,
        temperature,
        temp_read_time
    };

    console.log(`handling request to log temperature =>
        id: "${id}", timestamp: "${timestamp}", temperature: ${temperature}`)

    const params = {
        Item,
        TableName: 'temperatures'
    }

    console.log('make database request')
    docClient.put(params, function(err, data) {
        if (err) {
            // an error occurred while trying to communicate with the db
            console.warn(`error posting data to db "${id}": ${err}`)
            resp(500, { error: err })
        } else {
            // success
            resp(200, Item)
        }
    })
};
