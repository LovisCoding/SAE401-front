class Nav {

	// Déclaration du constructeur

	constructor() {
		console.log('Nav loaded');
	}

	// Méthode pour charger la barre de navigation

	loadNav() {
		document.addEventListener("DOMContentLoaded", () => {
			const navHTML = `
			<nav class="navbar navbar-expand-lg navbar-light">
				<a class="navbar-brand" href="#">
				<img src="./img/Logo_ScoNotesSimple.png" width="65" height="45" class="d-inline-block align-top logo" alt="ScoNotes"/>
				</a>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav ml-auto">
					<li class="nav-item">
						<a class="nav-link d-flex flex-column align-items-center text-center" href="/import">
							<img src="./img/Import.svg" width="25" height="25" class="d-inline-block align-top" alt="Importation"/>
							<span>Importation</span>
						</a>
					</li>
					<li class="nav-item">
						<a class="nav-link d-flex flex-column align-items-center text-center" href="/recap">
							<img src="./img/Recapitulatif.svg" width="25" height="25" class="d-inline-block align-top" alt="Récapitulatif"/>
							<span>Récapitulatif</span>
						</a>
					</li>
					<li class="nav-item">
						<a class="nav-link d-flex flex-column align-items-center text-center" href="/export">
							<img src="./img/Export.svg" width="25" height="25" class="d-inline-block align-top" alt="Exportation"/>
							<span>Exportation</span>
						</a>
					</li>
					<li class="nav-item">
						<a class="nav-link d-flex flex-column align-items-center text-center" href="#">
							<img src="./img/Profil.svg" width="25" height="25" class="d-inline-block align-top" alt="Profil"/>
							<span>Profil</span>
						</a>
					</li>
					<li class="nav-item">
						<a class="nav-link d-flex align-items-center justify-content-center" onclick="nav.arrowAnimation()" href="#">
							<img src="./img/Arrow.svg" width="25" height="25" class="arrow" alt=""/>
						</a>
					</li>
				</ul>
				</div>
			</nav>`;

			document.body.insertAdjacentHTML('afterbegin', navHTML);
		});
	}

	// Méthode pour animer la flèche présente dans la barre de navigation

	arrowAnimation() {
		document.querySelectorAll('.arrow').forEach(arrow => {
			arrow.addEventListener('click', () => {
				arrow.classList.toggle('rotate');
			});
		});
	}
}

// Instanciation de la classe Nav

const nav = new Nav();
nav.loadNav();