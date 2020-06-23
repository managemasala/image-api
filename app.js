const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(fileUpload());

mongoose.connect('mongodb://localhost:27017/fibiDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    url: String,
    name: String,
    type: String,
    size: String
});

userSchema.plugin(mongoose_fuzzy_searching, { fields: ["name"] });
 

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    User.find(function(err, found) {
        if(err) {
            res.send(err);
        } else {
            for(var i=0; i < req.body.limit; i++) {
               console.log(found[i]);
            }
        }
    });
});

app.get("/search", async function(req, res) {
    try {
    const users = await User.fuzzySearch(req.body.search);
    console.log(users);
    } catch(e) {
        console.log(e);
    }
    
});

app.post("/", function(req, res) {
    if(req.files.url.mimetype == "image/png") {
    req.files.url.mv("public/images/" + req.files.url.name, function(err) {
        if(err) {
            res.send(err);
        } else {
            const user = new User({
                url: "public/images/" + req.files.url.name,
                name: req.files.url.name,
                type: req.files.url.mimetype,
                size: req.files.url.size
            });
             user.save();
            res.send("successfully uploaded");
        }
    });
} else {
    res.send("Please enter a png image");
}
}); 

app.listen(3000, function(req, res) {
    console.log("server is running on port 3000.");
});