module.exports = {
  ifeq(a, b, options) {
    if (a == b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  getTime: function () {
    var myDate = new Date();
    var hour = myDate.getHours();
    var minute = myDate.getMinutes();
    var second = myDate.getSeconds();
    if (minute < 10) {
      minute = "0" + minute;
    }
    if (second < 10) {
      second = "0" + second;
    }
    return 'Текущее время: ' + hour + ":" + minute + ":" + second;
  },
  getSomeText: function () {
    return 'SomeText';
  }
}