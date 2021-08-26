  var mongoose = require('mongoose');

  var CampSchema= new mongoose.Schema({
    name: String,
    desc: String,
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
      username: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
});


module.exports = mongoose.model("Campground",CampSchema);