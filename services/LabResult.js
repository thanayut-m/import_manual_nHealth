const TimeHelper = require("../utils/TimeHelper");
const { query_db } = require("./func/ConnectDb");
const moment = require("moment");
const fileType = require("file-type");

const labResult = async (jsonData) => {
  try {
    if (!jsonData.labs?.[0]?.filebase64?.[0]?.filedata) {
      throw new Error("Missing file data in input JSON");
    }
    let lab_order_id = jsonData.orderNumber.toString().slice(-6);
    const buffer = Buffer.from(
      jsonData.labs[0].filebase64[0].filedata,
      "base64"
    );
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

    const fileInfo = await fileType.fromBuffer(buffer);
    const fileExt = fileInfo ? fileInfo.ext : "unknown";
    console.log(fileExt);

    if (fileExt === "pdf") {
      console.log("File type PDF.");
      await query_db(
        `INSERT INTO lab_order_image_pdf (
        lab_order_image_pdf_id,
        lab_order_image_pdf_file,
        lab_order_id,
        lab_order_image_pdf_date,
        lab_order_image_pdf_page
      ) VALUES (?,?,?,?,?)`,
        [maxid + 1, buffer, lab_order_id, dateTime, nextPageNo + 1]
      );
      console.log("Insert Type PDF success : ", jsonData);
    } else if (fileExt === "jpg") {
      console.log("File type JPG.");
      await query_db(
        `INSERT INTO lab_order_image(
          lab_order_image_id,
          lab_order_image_page_no,
          lab_order_image_picture,
          lab_order_id,
          lab_order_image_name
      )VALUES (?,?,?,?,?)`,
        [maxid + 1, nextPageNo + 1, buffer, lab_order_id, dateTime]
      );
      console.log("Insert Type JPG success : ", jsonData);
    } else {
      console.error("Unsupported file type:", fileExt);
    }

    // const newYear = TimeHelper.getYear();
    // const newMonth = TimeHelper.getMonth();
    // const newDay = TimeHelper.getDay();
    // const newHH = TimeHelper.getHH();
    // const newmm = TimeHelper.getmm();
    // const newss = TimeHelper.getss();

    // const fileName = `${newYear}${newMonth}${newDay}${newHH}${newmm}${newss}_${
    //   nextPageNo + 1
    // }_${jsonData.orderNumber}.Json`;
  } catch (err) {
    console.error(`Error LabResult : ${err.message}`);
  }
};

module.exports = { labResult };
