class Nav {

	// Déclaration du constructeur

	constructor() {
		this.isAdmin = localStorage.getItem('isadmin');
		this.token = localStorage.getItem('token');
		if (this.isAdmin == null || this.isAdmin == undefined) {
			window.location.href = 'http://localhost:8080/login';
		}
		this.loadNav() 

	}

	// Méthode pour charger la barre de navigation

	loadNav() {

		document.addEventListener("DOMContentLoaded", () => {
			let navHTML = `
			<nav class="navbar navbar-expand-lg navbar-light bg-light">
				<a   class="navbar-brand" href="/home">
					<img src="/img/Logo_ScoNotesSimple.png" width="65" height="45" class="d-inline-block align-top logo" alt="ScoNotes" id="navHome"/>
				</a>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				<div class="collapse navbar-collapse" id="navbarSupportedContent">
					<ul class="navbar-nav ml-auto">`
			if (this.isAdmin == 'true') {
				navHTML += `<li class="nav-item">
							<a class="nav-link d-flex flex-column align-items-center text-center" id="navImport" href="/import">
								<img src="/img/Import.svg" width="25" height="25" class="d-inline-block align-top" alt="Importation"/>
								<span>Importation</span>
							</a>
						</li>`
			}
			navHTML += `
						<li class="nav-item">
							<a class="nav-link d-flex flex-column align-items-center text-center" id="navRecap" href="/recap">
								<img src="/img/Recapitulatif.svg" width="25" height="25" class="d-inline-block align-top" alt="Récapitulatif"/>
								<span>Récapitulatif</span>
							</a>
						</li>
						<li class="nav-item">
							<a class="nav-link d-flex flex-column align-items-center text-center " id="navExport" href="/export">
								<img src="/img/Export.svg" width="25" height="25" class="d-inline-block align-top"  alt="Exportation"/>
								<span>Exportation</span>
							</a>
						</li>
						<li class="nav-item">
							<a class="d-flex align-items-center text-decoration-none" href="#" id="profile">
								<div class="d-flex flex-column align-items-center nav-link">
								<img src="/img/Profil.svg" width="25" height="25" class="d-inline-block align-top" alt="Profil"/>
								<span>Profil</span>
								</div>							
								<img src="/img/Arrow.svg" width="18" height="18" class="arrow default" alt="" id="arrowProfil"/>
							</a>
						</li>
						<div class="profile-popup" id="profilePopup">
						<div class="profile-info">
							<div class="profile-icon"><img src="/img/logoProfilePopUp.png" width="90" height="80" class="arrow" alt=""/></div>
							<div class="profile-text">
								<div class="username">${localStorage.getItem('identifiant')}</div>
								<div class="role">${localStorage.getItem('isadmin') === 'true' ? 'Administrateur' : 'Utilisateur '}</div>
							</div>
						</div>
						<button id="btnLogout" class="logout-button">Déconnexion</button>
					</div>
					</ul>
				</div>
			</nav>`;

			document.body.insertAdjacentHTML('afterbegin', navHTML);
			this.arrowAnimation();
			this.setSelectedNav();
			const profile = document.getElementById('profile');
			const profilePopup = document.getElementById('profilePopup');
			const btnLogout = document.getElementById('btnLogout');
			const arrow = document.getElementById('arrowProfil');

			profile.addEventListener('click', function () {
				if (profilePopup.style.display === 'none' || profilePopup.style.display === '') {
					profilePopup.style.display = 'block';
					arrow.classList.add('rotate');
					
					
				} else {
					profilePopup.style.display = 'none';
					arrow.classList.remove('rotate');
					
				}
				
			});

			document.addEventListener('click', function (event) {
				if (!profile.contains(event.target) && !profilePopup.contains(event.target)) {
					
					profilePopup.style.display = 'none';
					arrow.classList.remove('rotate');

					
				}
				if (btnLogout.contains(event.target)) {
					localStorage.removeItem('token');
					localStorage.removeItem('isadmin');
					localStorage.removeItem('identifiant');
					localStorage.removeItem('currentYear');
					window.location.href = 'http://localhost:8080/login';
				}
			});
			

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
	setSelectedNav() {
		switch (document.location.pathname) {
			case '/home':
			case '/home/':
				document.getElementById('navHome').classList.add('nav-selected');
				break;
			case '/import':
			case '/import/' :
				document.getElementById('navImport').classList.add('nav-selected');
				break;
			case '/recap':
				case '/recap/':
				document.getElementById('navRecap').classList.add('nav-selected');
				break;
			case '/export':
				case '/export/':
				document.getElementById('navExport').classList.add('nav-selected');
				break;

			default:
				break;
		}
	}
}

// Instanciation de la classe Nav

const nav = new Nav();