'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ':id': event.pathParameters.id
    }
  };

  // fetch from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Couldn\'t fetch the item.' }),
      });
      return;
    }

    let poll = result.Items.find(item => item.sort == 'poll-details');

    poll.votes = result.Items.filter(item => item.sort.indexOf('vote-') !== -1);

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(poll),
    };
    callback(null, response);
  });
};
