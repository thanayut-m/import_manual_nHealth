const { query_db } = require("../func/ConnectDb");
const { RequestOrder } = require("./RequestOeder");

const CheckOrder = async () => {
  try {
    // console.log("Hello CheckOrder...");
    const outlab_track = await query_db(
      `SELECT s.* FROM outlab_track s WHERE s.flag = "N" AND s.outlab_company_id = 3`
    );

    if (outlab_track.length > 0) {
      for (const row of outlab_track) {
        try {
          console.log(`New Order OutLab : ${row.lab_order_id}`);
          await RequestOrder({
            row: row.lab_order_id,
          });

          if (outlab_track.length > 0) {
            await query_db(
              `UPDATE outlab_track
              SET flag = ?
              WHERE lab_order_id = ? AND outlab_company_id = ?`,
              ["Y", row.lab_order_id, 3]
            );
          }
        } catch (error) {
          console.log("outlab_track", error.message);
        }
      }
    } else {
      console.log("No Request");
    }
  } catch (err) {
    console.log("Error CheckOrder :", err.message);
  }
};
module.exports = { CheckOrder };
