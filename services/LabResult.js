const Logger = require("../utils/Logger");
const TimeHelper = require("../utils/TimeHelper");
const logger = new Logger();
const { query_db } = require("./func/ConnectDb");
const moment = require("moment");

const labResult = async (jsonData) => {
  try {
    if (!jsonData.labs?.[0]?.filebase64?.[0]?.filedata) {
      throw new Error("Missing file data in input JSON");
    }
    let lab_order_id = jsonData.orderNumber.toString().slice(-6);
    const pdf = Buffer.from(jsonData.labs[0].filebase64[0].filedata, "base64");
    const dateTime = moment().format("YYYY-MM-DD");
    const result = await query_db(
      "SELECT MAX(lab_order_image_pdf_id) AS maxId FROM lab_order_image_pdf"
    );
    const maxid = result[0]?.maxId ?? 0;
    const pageResult = await query_db(
      "SELECT MAX(lab_order_image_pdf_page) AS maxPage FROM lab_order_image_pdf WHERE lab_order_id = ?",
      [lab_order_id]
    );
    const nextPageNo = pageResult[0]?.maxPage ?? 0;
    const insertPDF = await query_db(
      `INSERT INTO lab_order_image_pdf (
        lab_order_image_pdf_id,
        lab_order_image_pdf_file,
        lab_order_id,
        lab_order_image_pdf_date,
        lab_order_image_pdf_page
      ) VALUES (?,?,?,?,?)`,
      [maxid + 1, pdf, lab_order_id, dateTime, nextPageNo + 1]
    );
    console.log("Insert success : ", jsonData);

    const newYear = TimeHelper.getYear();
    const newMonth = TimeHelper.getMonth();
    const newDay = TimeHelper.getDay();
    const newHH = TimeHelper.getHH();
    const newmm = TimeHelper.getmm();
    const newss = TimeHelper.getss();

    logger.saveJSON(
      jsonData,
      `${newYear}${newMonth}${newDay}${newHH}${newmm}${newss}_${
        nextPageNo + 1
      }_${jsonData.orderNumber}`,
      "services/log/res"
    );
  } catch (err) {
    console.error(`Error LabResult : ${err.message}`);
  }
};

module.exports = { labResult };
