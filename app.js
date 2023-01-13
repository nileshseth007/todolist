const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _= require("lodash");

const app= express();

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connecting to MongoDB
mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://nileshseth007:clusterid007@cluster0.hswqffd.mongodb.net/todolistDB", function(err){
    if(err) console.log (err);
    else console.log("Connected to mongoDB");
})

const itemSchema = {name : String};

const Item = mongoose.model("Item", itemSchema);

const item1= new Item({
    name : "Buy Food"
})
const item2= new Item({
    name : "Cook Food"
})
const item3= new Item({
    name : "Eat Food"
})
const defaultItems = [item1, item2, item3];

const listSchema = {
    name : String,
    items : [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get('/',function(req,res){ 
   
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err) console.log(err);
                else console.log("Inserted Successfully");
            });
            res.redirect("/");
        }
        res.render("list",{listTitle: "Today", newListItems: foundItems});
    })
    
});


app.post("/", function(req, res){
    
    const itemName = req.body.newItem;
    const listTitle = req.body.list;

    const itemNew = new Item({
        name: itemName
    })

    if(listTitle === "Today"){
        itemNew.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listTitle}, function(err, foundList){
            
            foundList.items.push(itemNew);
            foundList.save();

            res.redirect("/" + listTitle);
        })
    }
    
})

app.post("/delete", function(req,res){
    const checkedItemId= req.body.checkbox ;

    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err) {
                console.log("Deleted Successfully");
                res.redirect("/");
            }
        })
    }

    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: { _id: checkedItemId }}}, function(err, foundList){
            if(!err) res.redirect("/"+ listName);
        })
    }
})



app.get('/:listName', (req, res) => {

    const listName =_.capitalize(req.params.listName);

    List.findOne({name : listName}, function(err, foundList){
        if(!foundList){
            const list = new List({
                name : listName,
                items: defaultItems
            })
            list.save();

            res.redirect("/" + listName);
        }
        else res.render("list.ejs",{listTitle: foundList.name, newListItems: foundList.items});  
    })
    
  })

app.get("/about", function(req,res){
    res.render("about");
})

app.listen(3000,function(){
    console.log('Server is running successfully on port 3000')
});