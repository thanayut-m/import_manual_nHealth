const express = require("express");
const { checkFile } = require("./services/checkFile");
const TimeHelper = require("./utils/TimeHelper");
const { GeneratePubSub } = require("./services/GeneratePubSub");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const runCheckFile = async () => {
  await checkFile();

  const newYear = TimeHelper.getYear();
  const newMonth = TimeHelper.getMonth();
  const newDay = TimeHelper.getDay();
  const newHH = TimeHelper.getHH();
  const newmm = TimeHelper.getmm();
  const newss = TimeHelper.getss();

  console.log(
    `[${newYear}:${newMonth}:${newDay}_${newHH}:${newmm}:${newss}] : File check completed.`
  );
};

const main = async () => {
  await runCheckFile();
  await GeneratePubSub();
};

const runRepeatedly = async () => {
  await main();
  setTimeout(runRepeatedly, 3000);
};

runRepeatedly();

app.listen(port, () => console.log(`Server is running on port: ${port}`));
