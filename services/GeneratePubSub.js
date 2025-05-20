const { PubSub } = require("@google-cloud/pubsub");

require("dotenv").config();

const subscriptionName = process.env.SUBPUB_SUBSCRIPTION_NAME;
const keyFile = process.env.SUBPUB_KEY_FILE;
const projectId = process.env.SUBPUB_PROJECT_ID;

const GeneratePubSub = () => {
  try {
    if (!subscriptionName || !keyFile || !projectId) {
      throw new Error("Missing environment variables for PubSub configuration");
    }

    const pubsub = new PubSub({
      projectId,
      keyFilename: keyFile,
    });

    const subscription = pubsub.subscription(subscriptionName);

    let messageCount = 0;
    let messages = [];

    const messageHandler = (message) => {
      messageCount++;
      messages.push({
        id: message.id,
        data: message.data.toString(),
        attributes: message.attributes,
      });

      message.ack();
    };

    subscription.on("message", messageHandler);

    setTimeout(() => {
      console.log("Result Message Pulled: \n", messages);
      console.log(`${messageCount} message(s) received.`);
      subscription.removeListener("message", messageHandler);
    }, 60 * 1000);
  } catch (err) {
    console.error(`Error LabResult : ${err.message}`);
  }
};

module.exports = { GeneratePubSub };
