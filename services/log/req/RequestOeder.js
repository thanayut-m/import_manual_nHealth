const { query_db } = require("../../func/ConnectDb");
const moment = require("moment");
const { getToken } = require("../../tokenService");
const { default: axios } = require("axios");
const TimeHelper = require("../../../utils/TimeHelper");
const Logger = require("../../../utils/Logger");

const RequestOrder = async ({ row }) => {
  try {
    const lab_order_outlab = await query_db(
      `SELECT 
        a.lab_order_id,
        a.lab_order_barcode_name,
        COUNT(a.lab_order_barcode_name) AS total_item,
        CONCAT(b.lab_order_date, ' ', b.lab_order_time) AS order_date,
        b.lab_order_priority_id,
        b.lab_order_staff_id,
        c.ward_name,
        b.patient_id
      FROM lab_order_outlab a
      INNER JOIN lab_order b ON a.lab_order_id = b.lab_order_id
      LEFT JOIN ward c ON b.ward_id = c.ward_id
      WHERE a.lab_order_id = ?
      AND a.outlab_send = 'Y'
      AND a.track_flag = 'N'
      GROUP BY a.lab_order_barcode_name`,
      [row]
    );

    for (const order of lab_order_outlab) {
      const patient = await query_db(
        `SELECT
            a.hn,
            a.cid,
            a.sex_id,
            b.pname_name,
            a.fname,
            a.lname,
            a.telephone,
            a.birthday,
            (SELECT a1.full_name FROM address a1 WHERE a1.chwpart = a.chwpart AND a1.amppart = a.amppart AND a1.tmbpart = a.tmbpart) as address,
            (SELECT a2.pocode FROM address a2 WHERE a2.chwpart = a.chwpart AND a2.amppart = a.amppart AND a2.tmbpart = a.tmbpart) as address_id,
            a.addrpart,
            a.zipcode
            FROM patient a
            LEFT JOIN pname b ON a.pname_id = b.pname_id
            WHERE a.patient_id = ?
            `,
        [order.patient_id]
      );

      for (const patients of patient) {
        try {
          const token = await getToken();
          const staff = order.lab_order_staff_id
            ? await query_db(
                `SELECT
                  a.staff_id,
                  a.staff_name
                FROM staff a
                WHERE a.staff_id = ?
                `,
                [order.lab_order_staff_id]
              )
            : null;

          const lab = await query_db(
            `SELECT
              a.outlab_code as labCode,
              '1' as qty,
              '' as remark,
              '' as projectId,
              '' as medicalBenefit,
              '' as customerComment
            FROM lab_order_outlab a
            WHERE a.lab_order_barcode_name = ?
            AND a.outlab_send = 'Y'
          `,
            [order.lab_order_barcode_name]
          );

          const priority =
            order.lab_order_priority_id === 3 ||
            order.lab_order_priority_id === 4
              ? "HIGH"
              : "NORMAL";

          let data = {
            customerLN: order.lab_order_barcode_name,
            barcode: order.lab_order_barcode_name,
            priority: priority,
            orderRemark: null,
            orderDate: order.order_date
              ? moment(order.order_date, "YYYY-MM-DD HH:mm:ss").format(
                  "YYYY-MM-DD HH:mm:ss"
                )
              : "ไม่ระบุ",
            ward: order.ward_name ? order.ward_name : "ไม่ระบุ",
            patient: {
              hn: patients.hn ? patients.hn : "ไม่ระบุ",
              citizenID: patients.cid ? patients.cid : "ไม่ระบุ",
              genderID: patients.sex_id ? patients.sex_id : "ไม่ระบุ",
              prefixEN: null,
              firstNameEN: null,
              middleNameEN: null,
              lastNameEN: null,
              prefixTH: patients.pname_name ? patients.pname_name : "ไม่ระบุ",
              firstNameTH: patients.fname ? patients.fname : "ไม่ระบุ",
              middleNameTH: null,
              lastNameTH: patients.lname ? patients.lname : "ไม่ระบุ",
              phoneNumber: patients.telephone ? patients.telephone : "ไม่ระบุ",
              email: null,
              dateOfBirth: patients.birthday
                ? moment(patients.birthday).format("YYYY-MM-DD")
                : "ไม่ระบุ",
              address: {
                address: patients.address
                  ? patients.address
                  : patients.addrpart,
                addressID: patients.address_id ? patients.address_id : "00000",
              },
            },
            doctor: {
              staffID: order.lab_order_staff_id
                ? order.lab_order_staff_id
                : "-",
              citizenID: null,
              genderID: null,
              prefixEN: null,
              firstNameEN: null,
              middleNameEN: null,
              lastNameEN: null,
              prefixTH: null,
              firstNameTH: staff ? staff.staff_name : "ไม่ระบุ",
              middleNameTH: null,
              lastNameTH: null,
              phoneNumber: null,
              email: null,
              licenceNumber: null,
              address: {
                address: null,
                addressID: null,
              },
            },
            labs: lab,
          };
          console.log("data:", JSON.stringify(data.customerLN, null, 2));

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const res = await axios.post(process.env.PATH_REQUEST, data, {
            headers: {
              serverKey: token.serverKey,
              Authorization: `${token.token_type} ${token.access_token}`,
              "Content-Type": "application/json",
            },
          });
          console.log(res);

          if (res.data.success === true) {
            await query_db(
              `UPDATE lab_order_outlab
              SET track_flag = ?, api_get_result_check = ?
              WHERE outlab_company_id = 3 AND lab_order_barcode_name = ?`,
              ["Y", "CREATE", order.lab_order_barcode_name]
            );

            const newYear = TimeHelper.getYear();
            const newMonth = TimeHelper.getMonth();
            const newDay = TimeHelper.getDay();
            const newHH = TimeHelper.getHH();
            const newmm = TimeHelper.getmm();
            const newss = TimeHelper.getss();

            const filename = `${newYear}${newMonth}${newDay}${newHH}${newmm}${newss}.txt`;
            Logger.saveJSON(data, filename, "file");
          } else {
            await query_db(
              `UPDATE lab_order_outlab
              SET api_message = ?
              WHERE lab_order_barcode_name = ?`,
              [res.data.message, order.lab_order_barcode_name]
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (err) {
    console.log("Error RequestOrder : ", err.message);
  }
};

module.exports = { RequestOrder };
