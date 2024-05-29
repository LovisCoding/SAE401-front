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
		window.location.href = "/home";
	}
}

// Instanciation de la classe Connection

new Connection();