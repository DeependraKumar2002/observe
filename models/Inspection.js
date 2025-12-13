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
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  pwdFriendly: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  wheelChair: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  rampFacility: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  workingFans: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  workingLights: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  
  // Section 2: Lab & Infrastructure
  labsOnGroundFloor: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  numberOfLabs: {
    type: Number,
    required: true
  },
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
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  cctvCount: {
    type: Number,
    required: true
  },
  cctvRecordingWorking: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  
  // Section 4: Power Backup
  generatorAvailable: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  generatorCapacity: {
    type: String,
    default: ''
  },
  upsAvailable: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  upsCapacity: {
    type: String,
    default: ''
  },
  powerBackupDuration: {
    type: String,
    required: true
  },
  
  // Section 5: During Exam
  examStartTime: {
    type: String,
    required: true
  },
  examEndTime: {
    type: String,
    required: true
  },
  questionPaperDownloadTime: {
    type: String,
    required: true
  },
  randomSeatAllocation: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  seatChangeRequest: {
    status: { type: String, enum: ['Yes', 'Not Available', 'Not Matched'], required: true },
    remark: String
  },
  
  // Section 6: Final
  finalRemarks: {
    type: String,
    required: true
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inspection', inspectionSchema);
