const mongoose = require("mongoose");
const Listing = require("../models/listining.js");
const initdata = require("./data.js");
async function main(){
await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().then(()=>{
    console.log("your db are running properly");
}).catch((e)=>{
    console.log(e);
})
const initDb = async()=>{
    await Listing.deleteMany({});
    console.log(initdata);
   const modifydata = initdata.map((obj)=>({...obj,owner:"6929a7f18e08820c6e1168b2"}));
   await  Listing.insertMany(modifydata);
   await Listing.updateMany({}, { $set: { image: "" } });
    console.log("data is saved");
}

initDb();
