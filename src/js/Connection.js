
class Connection {
	constructor() {
		
		this.btnValidate = document.querySelector("#btnValidate");
		this.btnValidate.addEventListener('click', function(event) {
			
			event.preventDefault();
			
			
			var identifiant = document.getElementById('identifiant').value;
			var password = document.getElementById('password').value;
			Connection.login(identifiant, password);
			
		});
	}
	
	static login(identifiant, password) {

		
			$.ajax({
				url: 'http://localhost:8000/api/verifyUser',
				type: 'POST',
				dataType: 'text',
				success: function(data){
					const jsData = JSON.parse(data);
					console.log(jsData.token);
					if (jsData.token) {
						console.log('Connexion réussie');
						localStorage.setItem('token', jsData.token);
						window.location.href = 'http://localhost:8080/home';

					} else {
						const inputIdentifiant = document.getElementById('identifiant');
						const inputPassword = document.getElementById('password');
						const divIdentifiantError = document.getElementById('identifiantError');
						const divPasswordError = document.getElementById('pwError');

						inputIdentifiant.value = '';
						inputPassword.value = '';
						inputIdentifiant.className = 'form-control is-invalid';
						inputPassword.className = 'form-control is-invalid';
						divIdentifiantError.innerHTML = 'Identifiant ou mot de passe incorrect';
						divPasswordError.innerHTML = 'Identifiant ou mot de passe incorrect';

					}
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader ("Authorization", "Basic " + btoa(identifiant + ":" + password));
				},
				xhrFields: {
					withCredentials: true
				  },
				
				error: function(jqXHR, textStatus, errorThrown){
					console.log('Erreur : ' + errorThrown);
				}
			});
	
	}
}
new Connection();