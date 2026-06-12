const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-admin-pin",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PATCH"
  },
  body: JSON.stringify(body)
});

const parseBody = (event) => {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch (error) {
    return null;
  }
};

const isValidStatus = (status) => ["open", "in_progress", "done"].includes(status);

module.exports = {
  jsonResponse,
  parseBody,
  isValidStatus
};
