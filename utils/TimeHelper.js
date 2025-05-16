const moment = require("moment");

class TimeHelper {
  static getFullTimestamp() {
    return moment().format("YYYYMMDDHHmmss");
  }

  static getYear() {
    return moment().format("YYYY");
  }

  static getMonth() {
    return moment().format("MM");
  }

  static getDay() {
    return moment().format("DD");
  }

  static getHH() {
    return moment().format("HH");
  }

  static getmm() {
    return moment().format("mm");
  }

  static getss() {
    return moment().format("ss");
  }
}

module.exports = TimeHelper;
