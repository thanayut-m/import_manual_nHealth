const { query_db } = require("../func/ConnectDb");
const { RequestOrder } = require("./RequestOrder");

const CheckOrder = async () => {
  try {
    const outlab_track = await query_db(
      `SELECT s.* FROM outlab_track s WHERE s.flag = "N" AND s.outlab_company_id = 3`
    );

    if (outlab_track.length > 0) {
      for (const row of outlab_track) {
        try {
          // console.log(`Start RequestOrder for: ${row.lab_order_id}`);
          await RequestOrder({ row: row.lab_order_id });
          // console.log(`Done RequestOrder for: ${row.lab_order_id}`);
          await query_db(
            `UPDATE outlab_track SET flag = ? WHERE lab_order_id = ? AND outlab_company_id = ? AND flag = 'N'`,
            ["Y", row.lab_order_id, 3]
          );
        } catch (error) {
          console.log("Error processing row:", row.lab_order_id, error.message);
        }
      }
    } else {
      console.log("No Request");
    }
  } catch (err) {
    console.log("Error CheckOrder:", err.message);
  }
};

module.exports = { CheckOrder };
