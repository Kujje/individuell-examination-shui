"use strict";
const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

module.exports.createMessage = async (event) => {
  console.log("Incoming event (createMessage):", event); 

  try {
    const body = JSON.parse(event.body || "{}");
    const { username, text } = body;

    if (!username || !text) {
      console.warn("Validation failed - missing username/text");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "username och text måste anges" }),
      };
    }

    const item = {
      id: Date.now().toString(), 
      username,
      text,
      createdAt: new Date().toISOString(),
    };

    await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();
    console.log("Message saved to DynamoDB:", item);

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("Error in createMessage:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

module.exports.getMessages = async () => {
  console.log("Fetching all messages...");

  try {
    const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    const sorted = (result.Items || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`Fetched ${sorted.length} messages`);
    return { statusCode: 200, body: JSON.stringify(sorted) };
  } catch (err) {
    console.error("Error in getMessages:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

module.exports.updateMessage = async (event) => {
  console.log("Incoming event (updateMessage):", event);

  try {
    const { id } = event.pathParameters || {};
    const body = JSON.parse(event.body || "{}");
    const { text } = body;

    if (!id || !text) {
      console.warn("Validation failed - missing id/text");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "id och text måste anges" }),
      };
    }

    const existing = await dynamo.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    if (!existing.Item) {
      console.warn(`Message with id=${id} not found`);
      return { statusCode: 404, body: JSON.stringify({ error: "Meddelandet finns inte" }) };
    }

    const updated = await dynamo.update({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "set #t = :t",
      ExpressionAttributeNames: { "#t": "text" },
      ExpressionAttributeValues: { ":t": text },
      ReturnValues: "ALL_NEW",
    }).promise();

    console.log("Message updated:", updated.Attributes);
    return { statusCode: 200, body: JSON.stringify(updated.Attributes) };
  } catch (err) {
    console.error("Error in updateMessage:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

module.exports.getMessagesByUser = async (event) => {
  console.log("Incoming event (getMessagesByUser):", event);

  try {
    const { username } = event.pathParameters || {};
    if (!username) {
      console.warn("Validation failed - username saknas");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "username krävs" }),
      };
    }

    const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
    const filtered = (result.Items || []).filter((item) => item.username === username);

    const sorted = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`Fetched ${sorted.length} messages for user=${username}`);
    return { statusCode: 200, body: JSON.stringify(sorted) };
  } catch (err) {
    console.error("Error in getMessagesByUser:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
