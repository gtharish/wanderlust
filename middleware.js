module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to use listings");
        return res.redirect("/login");
    }
   next();
};
const Listing = require("./models/listining");

module.exports.isOwner = async (req,res,next)=>{

    const listing = await Listing.findById(req.params.id);

    if(!listing.owner.equals(req.user._id)){
        req.flash("error","You are not the owner.");
        return res.redirect(`/listings/${req.params.id}/show`);
    }

    next();
}
module.exports.redirectUrl = (req,res,next)=>{
 if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;

 }
 next();
};