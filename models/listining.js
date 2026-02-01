const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Listingschema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    type: String,
    default: "C:/web project/MAJOR_project/photoes/default2.png",
    set: (v) => (v.trim() === "" ? "/photoes/default2.png" : v),
    required: true,
  },

  price: Number,
  location: String,
  country: String,
  reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review"
  }],
  owner:[{
     type:Schema.Types.ObjectId,
     ref:"User",
  }],
});

const Listing = mongoose.model("Listing", Listingschema);
module.exports = Listing;
