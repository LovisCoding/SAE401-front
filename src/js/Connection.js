class Connection {

	// Déclaration du constructeur

	constructor() {
		this.btnValidate = document.querySelector("#btnValidate");
		this.btnValidate.addEventListener('click', (event) => {
			event.preventDefault();

			var identifiant = document.getElementById('identifiant').value;
			var password = document.getElementById('password').value;
			Connection.login(identifiant, password);
		});

		this.modal = document.getElementById("myModal");
		this.btn = document.getElementById("aAcces");
		this.span = document.getElementsByClassName("close")[0];

		this.btn.onclick = (e) => {
			e.preventDefault();
			this.modal.style.display = "block";
		};

		this.span.onclick = () => {
			this.modal.style.display = "none";
		};

		window.onclick = (event) => {
			if (event.target == this.modal) {
				this.modal.style.display = "none";
			}
		};
	}

	// Méthode permettant de véfirier si l'utilisateur peut se connecter

	static login(identifiant, password) {
		$.ajax({
			url: 'http://localhost:8000/api/verifyUser',
			type: 'POST',
			dataType: 'text',
			success: function (data) {
				console.log(data);
				const jsData = JSON.parse(data);

				if (jsData.token) {
					localStorage.setItem('token', jsData.token);
					localStorage.setItem('isadmin', jsData.isadmin);
					localStorage.setItem('currentYear', 1);
					localStorage.setItem('identifiant', identifiant);
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
				xhr.setRequestHeader("Authorization", "Basic " + btoa(identifiant + ":" + password));
			},
			xhrFields: {
				withCredentials: true
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error("Error during login request:", textStatus, errorThrown);
			}
		});
	}
}

// Instanciation de la classe Connection

new Connection();