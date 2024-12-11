const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: { 
    type: String, 
    required: false, 
    unique: true, 
  },
  university: { 
    type: String, 
    required: false
  },
  major: { 
    type: String, 
    required: false 
  },
  decks:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck'
  }],
  quizzes:[{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz' 
  }],

}, {timestamps: true});

userSchema.statics.findOrCreateUserByClerkId = async function (clerkId) {
  // Attempt to find the document
  let user = await this.findOne({ clerkId });
  
  // If user is found, return it
  if (user) return user;

  // If user is not found, create it
  user = new this({ clerkId, username: `${clerkId}` });
  await user.save();
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;