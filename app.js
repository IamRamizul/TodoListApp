//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Ramiz-admin:nqz243EeW6KMcsCA@cluster0.sub9uhj.mongodb.net/?retryWrites=true&w=majority");

const itemsSchema = {
	name : String
};

const customListSchema = {
	name : String,
	tasks : [itemsSchema]
};

const Item = mongoose.model("task",itemsSchema );

const customTask = mongoose.model("customTask", customListSchema);

const item1 = new Item({
	name: "Hello welcome to the db"
});

const item2 = new Item({
	name: "THsi is the item two"
});

const item3 = new Item({
	name: "Delete the file"
});

var items = [item1, item2, item3];

/**/
const day = date.getDate();
const year =  new Date().getFullYear();

app.get("/", function(req, res) {

	Item.find({}, function(error, foundItems){
	if(items.length == 0){
		Item.insertMany(items, function(error) {
			if(error){
				console.log(error);
			}else{
				console.log("The database has been updated successfully.")
				
			}});
		res.redirect("/");
	}else{
		res.render("list", {listTitle: day, newListItems: foundItems, year :year });
	};
	});
	
	
});

app.post("/delete", function(req, res){
	var checkedTask = req.body.checkbox;
	var listName = req.body.listName;
	
	if(listName === day){
		Item.findByIdAndRemove(checkedTask, function(error){
		if(error){
			console.log(error);
		}else{
			console.log("Successfully deleted the task");
			res.redirect("/");
		};
	});
	}else{
		customTask.findOneAndUpdate({name : listName}, {$pull : {tasks: {_id : checkedTask}}}, function(error, results){
			if(!error){
				res.redirect("/" + listName);
			}
		})
	}
	
	
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  
	const item = new Item({
		name: itemName
	});
	
	if(listName === day ){
		item.save();
		items.push(item);
		res.redirect("/");
	}else{
		customTask.findOne({name: listName}, function(error, foundList){
			foundList.tasks.push(item);
			foundList.save();
			res.redirect("/"+ listName);
		})
	}
	
});

app.get("/:customList", function(req,res){
	var customListName = _.capitalize(req.params.customList);
	customTask.findOne({name: customListName}, function(err, results){
		if(!err){
			if(!results){
				const custom = new customTask({
					name: customListName,
					tasks: []
				});
				custom.save();
				res.redirect("/"+customListName);
			}else{
				res.render("list", {listTitle: results.name, newListItems: results.tasks})
			};
		};
	});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
	port = 3000;
};
app.listen(port, function() {
  console.log("Server started Successfully!");
});
