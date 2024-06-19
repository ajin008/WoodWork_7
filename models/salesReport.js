const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  deliveredDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  couponDeduction: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true
  }
});

const SalesReport = mongoose.model('SalesReport', salesReportSchema);

module.exports = SalesReport;
