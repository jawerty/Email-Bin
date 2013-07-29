_error = ""
_message = ""
var check = require('validator').check;
var Email   = require("emailjs");
var inbox = require("inbox");
var fs = require("fs");

function generateEmail(address, password, req, res){
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
				for(i=0;i<=amount-1;i++){
					subject = messages[i].title
					from = messages[i].from.name +" <"+messages[i].from.address+">"
					// to = messages[x].to.name +" <"+messages[x].to.address+">"
					full_date = messages[i].date.toString()
					temp_date = full_date.split(" ")
					short_date = temp_date[0] +" "+ temp_date[1] +" "+ temp_date[2] +" "+ temp_date[3]


					cc = []
					if (messages[i].cc) {
						for (ii=0;ii<messages[i].cc.length;ii++) {
							cc.push(messages[i].cc[ii].name +" <"+messages[i].cc[ii].address+">")
						}
				  }
				  
				  console.log(i)
				  
					email[i] = {subject: subject, from: from, full_date: full_date, short_date: short_date, cc: cc, id: i}

				}      
				req.session.emails = email
		    res.redirect('/')

			});
		});
	});
}

exports.index = function(req, res){
	if (req.session.emails) {
		emails = req.session.emails
	} else {
		emails = null
	}

	if (req.session.authorized == true){
		authorized = true;
	} else { 
		authorized = false;
	}

	res.render('index', { title: 'Email Bin', authorized: authorized, emails: emails, message: _message });
	_message = ""

};

exports.auth_get = function(req, res){
	res.render('auth', { title: 'Email Authentication', error: _error});
	_error = ""
	_message = ""
};

exports.auth_post = function(req, res, next){
	(function main(){
		try {
			address = req.body.email_address || req.session.address
			password = req.body.email_password || req.session.password

			if (req.session.authorized != true) {
				req.session.password = password
				req.session.address = address
				req.session.authorized = true
			}

			check(address).len(6, 64).isEmail()
			
			generateEmail(address, password, req, res)

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
	})();
};

exports.compose_post = function(req, res){

	if (req.session.authorized == true) {
		address_1 = req.session.address.split("@")
		host = address_1[1]

		try {
			var server  = Email.server.connect({
			   user:    req.session.address, 
			   password: req.session.password, 
			   host:    "smtp."+host, 
			   ssl:     true
			});

			server.send({
			   text:    req.body.message_body, 
			   from:    req.session.address, 
			   to:      req.body.to,
			   cc:      req.body.cc,
			   subject: req.body.subject
			}, function(err, message) { console.log(err || message); });
			
			_message = "Message sent."
			res.redirect('/')
		} catch (e) {
			console.log(e)
			_message = "Message not sent. Message may have not been structured correctly."
			res.redirect('/')
		}
	} else {
		res.redirect('/')
	}
};

exports.refresh = function(req, res){
	if (req.session.address && req.session.address) {
		generateEmail(req.session.address, req.session.password, req, res);
	} else {
		res.redirect('/')
	}
}
