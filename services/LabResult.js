const Logger = require("../utils/Logger");
const logger = new Logger();
const TimeHelper = require("../utils/TimeHelper");
const { query_db } = require("./func/ConnectDb");
const moment = require("moment");
const fileType = require("file-type");

const labResult = async (jsonData) => {
  try {
    if (!jsonData.labs?.[0]?.filebase64?.[0]?.filedata) {
      throw new Error("Missing file data in input JSON");
    }

    let barcode = jsonData.orderNumber.toString();

    const barcode_query = await query_db(
      `SELECT 
        a.lab_order_id 
        FROM lab_order_outlab a 
        LEFT JOIN lab_order_barcode b ON b.lab_order_id = a.lab_order_id 
        WHERE a.lab_order_barcode_name = ? OR b.instruments_order_number = ?`,
      [barcode, barcode]
    );

    const lab_order_id = barcode_query[0].lab_order_id;
    console.log("lab_order_id", lab_order_id);

    const buffer = Buffer.from(
      jsonData.labs[0].filebase64[0].filedata,
      "base64"
    );
    const dateTime = moment().format("YYYY-MM-DD HH:MM:SS");

    // PDF
    const MaxPdf = await query_db(
      "SELECT MAX(lab_order_image_pdf_id) AS maxId FROM lab_order_image_pdf"
    );
    const MaxPdfId = MaxPdf[0]?.maxId ?? 0;
    const pagePdfResult = await query_db(
      "SELECT MAX(lab_order_image_pdf_page) AS maxPage FROM lab_order_image_pdf WHERE lab_order_id = ?",
      [lab_order_id]
    );
    const nextPagePdfNo = pagePdfResult[0]?.maxPage ?? 0;

    // Image
    const MaxImage = await query_db(
      "SELECT MAX(lab_order_image_id) AS maxId FROM lab_order_image"
    );
    const MaxImageId = MaxImage[0]?.maxId ?? 0;
    const pageImageResult = await query_db(
      "SELECT MAX(lab_order_image_page_no) AS maxPage FROM lab_order_image WHERE lab_order_id = ?",
      [lab_order_id]
    );
    const nextPageImageNo = pageImageResult[0]?.maxPage ?? 0;

    const fileInfo = await fileType.fromBuffer(buffer);
    const fileExt = fileInfo ? fileInfo.ext : "unknown";
    console.log(fileExt);

    const newYear = TimeHelper.getYear();
    const newMonth = TimeHelper.getMonth();
    const newDay = TimeHelper.getDay();
    const newHH = TimeHelper.getHH();
    const newmm = TimeHelper.getmm();
    const newss = TimeHelper.getss();

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
        [MaxPdfId + 1, buffer, lab_order_id, dateTime, nextPagePdfNo + 1]
      );

      console.log(
        "Insert Type PDF success : ",
        JSON.stringify(jsonData, null, 2)
      );

      await query_db(
        `UPDATE lab_order_outlab
        SET api_get_result_check = ?,api_get_result_datetime =?
        WHERE lab_order_id = ?`,
        ["SUCCESS", moment().format("YYYY-MM-DD HH:mm:ss"), lab_order_id]
      );

      const fileName = `${newYear}${newMonth}${newDay}${newHH}${newmm}${newss}_${
        nextPagePdfNo + 1
      }_${jsonData.orderNumber}.txt`;
      logger.saveJSON(jsonData, fileName, `LOG/RES/${newYear}_${newMonth}`);
    } else if (fileExt === "jpg") {
      console.log("File type JPG.");
      const result = await query_db(
        `INSERT INTO lab_order_image(
          lab_order_image_id,
          lab_order_image_page_no,
          lab_order_image_picture,
          lab_order_id,
          lab_order_image_name
      )VALUES (?,?,?,?,?)`,
        [MaxImageId + 1, nextPageImageNo + 1, buffer, lab_order_id, dateTime]
      );

      console.log(
        "Insert Type JPG success : ",
        JSON.stringify(jsonData, null, 2)
      );

      await query_db(
        `UPDATE lab_order_outlab
        SET api_get_result_check = ?,api_get_result_datetime =?
        WHERE lab_order_id = ?`,
        ["SUCCESS", moment().format("YYYY-MM-DD HH:mm:ss"), lab_order_id]
      );

      const fileName = `${newYear}${newMonth}${newDay}${newHH}${newmm}${newss}_${
        nextPageImageNo + 1
      }_${jsonData.orderNumber}.txt`;
      logger.saveJSON(jsonData, fileName, `LOG/RES/${newYear}_${newMonth}`);
    } else {
      console.error("Unsupported file type:", fileExt);
    }
  } catch (err) {
    console.error(`Error LabResult : ${err.message}`);
  }
};

module.exports = { labResult };
