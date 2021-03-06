import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
var rp = require("request-promise");

const blastURI = process.env.IS_OFFLINE
  ? "http://localhost:5000"
  : "http://ec2-3-14-150-247.us-east-2.compute.amazonaws.com/";

function computeAlignment(userId, sequenceURI, eValue, wordSize) {
  return rp({
    uri: blastURI,
    qs: { userId, sequenceURI, eValue, wordSize },
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
  const eValue = data.eValue;
  const wordSize = data.wordSize;
  const defaultOutput = {
    outputURI: "empty",
    inputSequences: [],
    outputAlignments: []
  };
  let params = {
    TableName: "ginkgo-alignments",
    Item: {
      userId: userId,
      sequenceName: data.sequenceName,
      sequenceURI: sequenceURI,
      status: "computing",
      createdAt: Date.now(),
      output: defaultOutput
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
  let output;
  let status;
  try {
    output = await computeAlignment(userId, sequenceURI, eValue, wordSize);
    status = "success";
    console.log(`alignment found: ${JSON.stringify(output)}`);
  } catch (e) {
    console.log(e);
    output = defaultOutput;
    status = "failure";
    console.log(`alignment not found:`);
  }
  params = {
    TableName: "ginkgo-alignments",
    Key: { userId, sequenceURI },
    UpdateExpression: "set #output = :o, #status = :s",
    ExpressionAttributeValues: { ":o": output, ":s": status },
    ReturnValues: "UPDATED_NEW",
    ExpressionAttributeNames: {
      "#output": "output",
      "#status": "status"
    }
  };
  try {
    await dynamoDbLib.call("update", params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    params.ExpressionAttributeValues = { ":o": defaultOutput, ":s": "failure" };
    await dynamoDbLib.call("update", params);
    return failure({ status: false });
  }
}
