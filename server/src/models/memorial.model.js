const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  location: String,
  startYear: Number,
  endYear: Number
});

const familyMemberSchema = new mongoose.Schema({
  relationship: { type: String, required: true },
  fullName: { type: String, required: true },
  identityType: { type: String, enum: ['national_id', 'passport', 'ssn'], required: true },
  identityNumber: { type: String, required: true }, 
  email: String,
  phoneNumber: String,
  birthdate: Date,
  isLiving: { type: Boolean, default: true }
});

const tributeSchema = new mongoose.Schema({
  message: String,
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isAnonymous: { type: Boolean, default: false },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String
});

const causeOfDeathSchema = new mongoose.Schema({
  primaryCause: { type: String, required: true },
  majorEvent: {
    type: String,
    enum: ['war_conflict', 'natural_disaster', 'pandemic_disease', 'major_accident', 'not_related'],
    required: true
  },
  eventName: String,
  eventDate: Date
});


const memorialSchema = new mongoose.Schema({
  mainPicture: { type: String, required: true },
  fullName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  placeOfBirth: { type: String, required: true },
  birthdayReminder: { type: Boolean, default: false },
  deathDate: { type: Date, required: true },
  serviceDate: Date,
  serviceLocation: String,
  serviceDetails: String,
  biography: { type: String, required: true },
  identityType: { type: String, enum: ['national_id', 'passport', 'ssn'], required: true },
  identityNumber: { type: String, required: true },
  nickName: String,
  maidenName: String,
  nationality: { type: String, required: true },
  religion: String,
  languagesSpoken: [String],
  favoriteQuote: String,
  education: [educationSchema],
  militaryService: { type: Boolean, default: false },
  familyMembers: [familyMemberSchema],
  causeOfDeath: { type: causeOfDeathSchema, required: true }, 
  additionalMedia: [{
    type: { type: String, enum: ['photo', 'video'] },
    url: String
  }],
  enableDigitalFlowers: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  tributes: [tributeSchema],
  totalTributes: {
    amount: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps on save
memorialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate total tributes
memorialSchema.methods.updateTotalTributes = function() {
  const total = this.tributes.reduce((acc, tribute) => acc + tribute.amount, 0);
  this.totalTributes = {
    amount: total,
    count: this.tributes.length
  };
};

const Memorial = mongoose.model('Memorial', memorialSchema);

module.exports = Memorial;
