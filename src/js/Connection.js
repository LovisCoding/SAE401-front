
class Connection {
	constructor() {
		
		this.btnValidate = document.querySelector("#btnValidate");
		this.btnValidate.addEventListener('click', function(event) {
			console.log(event);
			
			event.preventDefault();
			
			
			var identifiant = document.getElementById('identifiant').value;
			var password = document.getElementById('password').value;
			Connection.login(identifiant, password);
			
		});
	}
	static login(identifiant, password) {
		axios.get('http://localhost:8000/api/verifyUser', [{
			identifiant: identifiant,
			password: password
		}])
		.then(function (response) {
			console.log(response);
		})
		.catch(function (error) {
			console.log(error);
		});
	
	}
}
new Connection();