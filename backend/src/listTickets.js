const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { jsonResponse } = require("./common");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

exports.handler = async () => {
  const result = await ddb.send(
    new ScanCommand({
      TableName: process.env.TICKETS_TABLE
    })
  );

  const items = result.Items || [];
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return jsonResponse(200, { items });
};
