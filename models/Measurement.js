const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  field1: {
    type: Number,
    required: true
  },
  field2: {
    type: Number,
    required: true
  },
  field3: {
    type: Number,
    required: true
  },
  sensor_id: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: true
});

measurementSchema.index({ timestamp: 1, sensor_id: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);