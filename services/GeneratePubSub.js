const { PubSub } = require("@google-cloud/pubsub");
const TimeHelper = require("../utils/TimeHelper");
require("dotenv").config();

const subscriptionName = process.env.SUBPUB_SUBSCRIPTION_NAME;
const keyFile = process.env.SUBPUB_KEY_FILE;
const projectId = process.env.SUBPUB_PROJECT_ID;

const pubsub = new PubSub({
  projectId,
  keyFilename: keyFile,
});

async function GeneratePubSub() {
  const subscription = pubsub.subscription(subscriptionName);
  let messageCount = 0;
  let data = [];
  const messageHandler = async (message) => {
    const result = JSON.parse(message.data);
    const filePubSub = `PubSub.txt`;
    try {
      data.push({
        id: message.id,
        attributes: message.attributes,
        ...result,
      });
      messageCount += 1;
      message.ack();
    } catch (err) {
      console.log(err);
    }
  };
  subscription.on("message", messageHandler);
  setTimeout(() => {
    console.log("Result Message Pulled: \n", data);
    console.log(`${messageCount} message(s) received.`);
    subscription.removeListener("message", messageHandler);
  }, 3000);
}

module.exports = { GeneratePubSub };
