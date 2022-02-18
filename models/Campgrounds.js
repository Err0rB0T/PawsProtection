  var mongoose = require('mongoose');

  var CampSchema= new mongoose.Schema({
    title: String,
    incidentDesc: String,
    abuserName: String,
    abuserRoll: String,
    abuserNo: String,
    witnessNo: String,
    location: String,
    
    createdAt: { type: Date, default: Date.now },
    status: Boolean,
    img:
    {
        data: Buffer,
        contentType: String
    },
    author:{
      id:{
        type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      enrollment: String,
      fullName: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
});


module.exports = mongoose.model("Campground",CampSchema);