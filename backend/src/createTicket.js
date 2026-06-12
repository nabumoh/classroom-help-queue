const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("node:crypto");
const { jsonResponse, parseBody } = require("./common");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const body = parseBody(event);

  if (body === null) {
    return jsonResponse(400, { message: "Invalid JSON body" });
  }

  const { studentName, topic, description = "", urgency = "normal" } = body;

  if (!studentName || !topic) {
    return jsonResponse(400, { message: "studentName and topic are required" });
  }

  if (!["low", "normal", "high"].includes(urgency)) {
    return jsonResponse(400, { message: "urgency must be one of: low, normal, high" });
  }

  const ticket = {
    ticketId: crypto.randomUUID(),
    studentName,
    topic,
    description,
    urgency,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ddb.send(
    new PutCommand({
      TableName: process.env.TICKETS_TABLE,
      Item: ticket
    })
  );

  return jsonResponse(201, ticket);
};
