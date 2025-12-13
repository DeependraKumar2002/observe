const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  observerEmail: {
    type: String,
    required: true
  },
  centerName: {
    type: String,
    required: true
  },
  centerCode: {
    type: String,
    required: true
  },
  // Section 1: Pre-Exam Facilities
  drinkingWater: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  pwdFriendly: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  wheelChair: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  rampFacility: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  workingFans: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  workingLights: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },

  // Section 2: Lab & Infrastructure
  labsOnGroundFloor: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  numberOfLabs: [{
    floor: { type: Number, required: true },
    count: { type: Number, required: true }
  }],
  totalSystemCount: {
    type: Number,
    required: true
  },
  workingSystemsCount: {
    type: Number,
    required: true
  },

  // Section 3: CCTV
  cctvWorking: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  cctvCount: {
    type: Number,
    required: true
  },
  cctvRecordingWorking: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },

  // Section 4: Power Backup
  generatorAvailable: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  generatorCapacity: {
    type: Number,
    default: 0
  },
  upsAvailable: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  upsCapacity: {
    type: Number,
    default: 0
  },
  powerBackupDuration: {
    type: String,
    required: true
  },

  // Section 5: During Exam
  examStartDate: {
    type: String,
    required: true
  },
  examStartTime: {
    type: String,
    required: true
  },
  examEndDate: {
    type: String,
    required: true
  },
  examEndTime: {
    type: String,
    required: true
  },
  downloadDate: {
    type: String,
    required: true
  },
  downloadTime: {
    type: String,
    required: true
  },
  randomSeatAllocation: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },
  seatChangeRequest: {
    status: { type: String, enum: ['Yes', 'No'], required: true },
    remark: String,
    imageUrl: String
  },

  // Section 6: Final
  finalRemarks: {
    type: String,
    required: true
  },

  // Images
  images: [{
    uri: String,
    section: String,
    fieldName: String,
    timestamp: Date
  }],

  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inspection', inspectionSchema);