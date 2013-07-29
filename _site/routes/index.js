_error = ""
var check = require('validator').check;
var nodemailer = require("nodemailer");
var email   = require("emailjs");
var inbox = require("inbox");
var fs = require("fs");

exports.index = function(req, res){
	if (req.session.authorized == true){
		authorized = true;
	} else { 
	  authorized = false;
	}

  res.render('index', { title: 'Mail Bin', authorized: authorized });
};

exports.auth_get = function(req, res){
  res.render('auth', { title: 'Email Authorization', error: _error});
  _error = ""
};

exports.auth_post = function(req, res){
  try {
  	address = req.body.email_address
    password = req.body.email_password
  	
  	check(address).len(6, 64).isEmail()
  	req.session.authorized = true

  	address_1 = address.split("@")
  	host = address_1[1]

	  var client = inbox.createConnection(false, "imap."+host, {
        secureConnection: true,
        auth:{
            user: address,
            pass: password
        }
    });

    client.connect();
    amount = 10;

    client.on("connect", function(){
        console.log("Successfully connected to server");
    		client.openMailbox("INBOX", function(error, info){
            if(error) throw error;
            console.log("Message count in INBOX: " + info.count);
            client.listMessages(-amount, function(err, messages){
				       	email = []
				       	
				        for (x=0;x<=messages.length-1;x++){
				            subject = messages[x].title
				            from = messages[x].from.name +" <"+messages[x].from.address+">"
				       			// to = messages[x].to.name +" <"+messages[x].to.address+">"
				       			full_date = messages[x].date.toString()
				       			temp_date = full_date.split(" ")
				       			short_date = temp_date[0] +" "+ temp_date[1] +" "+ temp_date[2]
				       			
				       			cc = []
				       			if (messages[x].cc) {
				       				for (i=0;i<=messages[x].cc.length;i++) {
				       					cc.push(messages[x].cc[i].name +" <"+messages[x].cc[i].address+">")
				       				}
				       			}

				       			var message_body
				       			client.createMessageStream(messages[x].UID)

				       			email[x] = [subject, from, full_date, short_date, cc]
				        };
				        console.log(email)
				    });
        });
    });
	  /*server.send({
		   text:    "i hope this works", 
		   from:    address, 
		   to:      address,
		   subject: "testing emailjs"
		}, function(err, message) { console.log(err || message); });*/
  	
  	res.redirect("/")
  } catch (e) {
  	req.session.authorized = false
  	if (e.name == "ValidatorError"){
  		_error = "Invalid email address. Try again."
  		res.redirect("/auth")	
  	} else {
  		console.log(e)
  		_error = "Server error. Try again."
  		res.redirect("/auth")	
  	}
  }
};

exports.compose_get = function(req, res){

};

exports.compose_post = function(req, res){

};