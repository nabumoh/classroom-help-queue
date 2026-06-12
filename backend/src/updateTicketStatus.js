const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { jsonResponse, parseBody, isValidStatus } = require("./common");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  if (process.env.ADMIN_PIN && event.headers?.["x-admin-pin"] !== process.env.ADMIN_PIN) {
    return jsonResponse(401, { message: "Unauthorized" });
  }

  const ticketId = event.pathParameters?.ticketId;
  const body = parseBody(event);

  if (!ticketId) {
    return jsonResponse(400, { message: "ticketId path parameter is required" });
  }

  if (body === null) {
    return jsonResponse(400, { message: "Invalid JSON body" });
  }

  const { status } = body;

  if (!isValidStatus(status)) {
    return jsonResponse(400, { message: "status must be one of: open, in_progress, done" });
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TICKETS_TABLE,
        Key: { ticketId },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": new Date().toISOString()
        },
        ConditionExpression: "attribute_exists(ticketId)",
        ReturnValues: "ALL_NEW"
      })
    );

    return jsonResponse(200, result.Attributes);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return jsonResponse(404, { message: "Ticket not found" });
    }

    throw error;
  }
};
