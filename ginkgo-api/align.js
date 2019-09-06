import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
var rp = require("request-promise");

const blastURI = process.env.IS_OFFLINE ? "http://localhost:5000" : "idk";

function computeAlignment(userId, sequenceURI) {
  return rp({
    uri: blastURI,
    qs: { userId, sequenceURI },
    json: true
  }).catch(function(err) {
    console.log(err);
  });
}

export async function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);
  const userId = event.requestContext.identity.cognitoIdentityId;
  const sequenceURI = data.sequenceURI;
  let params = {
    TableName: "ginkgo-alignments",
    Item: {
      userId: userId,
      sequenceName: data.sequenceName,
      sequenceURI: sequenceURI,
      outputURI: "computing",
      createdAt: Date.now()
    }
  };
  try {
    await dynamoDbLib.call("put", params);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
  console.log(
    `start computeAlignment(userId=${userId}, sequenceURI=${sequenceURI})`
  );
  let alignment = await computeAlignment(userId, sequenceURI);
  console.log(`alignment found: ${alignment}`);
  params.Key = { userId, sequenceURI };
  params.UpdateExpression = "set outputURI = :o";
  params.ExpressionAttributeValues = { ":o": alignment };
  params.ReturnValues = "UPDATED_NEW";
  try {
    await dynamoDbLib.call("update", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}
