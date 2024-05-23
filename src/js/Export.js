class Export {

	constructor(settingsSelector, settingsPanelSelector) {
		this.settingsImage = document.querySelector(settingsSelector);
		this.settingsPanel = document.querySelector(settingsPanelSelector);
		this.labelFileSign = document.getElementById('labelFileSign');
		this.logoFileSign = document.getElementById('logoFileSign');
		this.labelLogo2 = document.getElementById('labelLogo2');
		this.logoLogo2 = document.getElementById('logoLogo2');
		this.logoLogo = document.getElementById('logoLogo');
		this.labelLogo = document.getElementById('labelLogo');

		this.setupListeners();
		this.loadStudent();
		this.setupSubmitListener();
		this.setupStudentProcessListener();

		const idAnnee = localStorage.getItem('currentYear');
		this.loadSemestre(idAnnee);
	}

	async loadSemestre(idAnnee) {
		let lstSemestres = await this.getSemestres();
		let semesters = lstSemestres.filter(item => item.id_annee == idAnnee);
		semesters.sort((a, b) => a.label.localeCompare(b.label));
		const selectElement = document.getElementById('semester');
	
		semesters.forEach(semester => {
			const option = document.createElement('option');
			option.textContent = semester.label;
			selectElement.appendChild(option);
		});
	
	}

	async getSemestres() {
		try {
			const response = await fetch(`http://localhost:8000/api/semestre`);	
			const data = await response.json();
			if (data && Array.isArray(data)) {
				return data; 
			}
			return []; // Retourner une liste vide si aucune compétence n'est trouvée
		} catch (error) {
			console.error('Une erreur s\'est produite :', error);
			return []; // Retourner une liste vide en cas d'erreur
		}
	}
	

	setupListeners() {
		this.settingsImage.addEventListener('click', (event) => {
			event.stopPropagation(); 
			this.toggleSettingsPanel();
		});

		document.addEventListener('click', (event) => {
			const isClickInsideSettings = this.settingsPanel.contains(event.target);
			const isClickOnSettingsImage = event.target === this.settingsImage;
			
			if (!isClickInsideSettings && !isClickOnSettingsImage) {
				this.hideSettingsPanel();
			}
		});
		this.labelFileSign.addEventListener('change', () => {
			this.labelFileSign.classList.add('validate');
			this.logoFileSign.src = '/img/Check.svg';
			this.logoFileSign.width = 20;
			this.logoFileSign.height = 20;
		})
		this.labelLogo2.addEventListener('change', () => {
			this.labelLogo2.classList.add('validate');
			this.logoLogo2.src = '/img/Check.svg';
			this.logoLogo2.width = 20;
			this.logoLogo2.height = 20;
		})
		this.labelLogo.addEventListener('change', () => {
			this.labelLogo.classList.add('validate');
			this.logoLogo.src = '/img/Check.svg';
			this.logoLogo.width = 20;
			this.logoLogo.height = 20;
		})
	}

	toggleSettingsPanel() {
		this.settingsPanel.classList.toggle('show');
		const settingsElements = this.settingsPanel.querySelectorAll('*');
		settingsElements.forEach(element => {
			element.classList.toggle('show');
		});
	}

	hideSettingsPanel() {
		this.settingsPanel.classList.remove('show');
		const settingsElements = this.settingsPanel.querySelectorAll('*');
		settingsElements.forEach(element => {
			element.classList.remove('show');
		});
	}

	loadStudent() {
		$.ajax({
			url: 'http://localhost:8000/api/etudiant',
			type: 'GET',
			dataType: 'json',
			success: function(data){
				$.each(data, function(index, etudiant){
					if (etudiant.cursus.includes("S5")) {
						$('.student').append('<option value="' + etudiant.id_etu + '">' + etudiant.nom_etu + ' ' + etudiant.prenom_etu + '</option>');
					}
				});
				exportInstance.verifyStudentInListAvis();
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.error("Error loading students:", textStatus, errorThrown);
			}
		});
	}

	verifyStudentInListAvis() {
		const promises = [];
		$('.student option').each(function() {
			const studentId = $(this).val();
			const promise = $.ajax({
				url: 'http://localhost:8000/api/avis',
				type: 'GET',
				dataType: 'json',
			}).then((data) => {
				const avisExists = data.some(avis => avis.id_etu === parseInt(studentId));
				if (!avisExists) {
					$('#exportStudent').prop('disabled', true);
					$('#exportStudent').addClass('disabled');
					$('#exportStudent').css('background-color', 'grey');
					$('#exportStudent').css('cursor', 'not-allowed');
					return false;
				}
			}).catch((jqXHR, textStatus, errorThrown) => {
				console.error("Error checking student's avis:", textStatus, errorThrown);
			});
			promises.push(promise);
		});
	}

	setupStudentProcessListener() {
		$('#addStudent').click(() => {
			const selectedStudentId = $('.student').val();

			$.ajax({
				url: 'http://localhost:8000/api/avis',
				type: 'GET',
				dataType: 'json',
				success: function(data) {
					const avis = data.find(avis => avis.id_etu === parseInt(selectedStudentId));
					if (avis) {
						$('#avisMaster').val(avis.avis_master || 'Sans avis');
						$('#avisEcoleIngenieur').val(avis.avis_inge || 'Sans avis');
					} else {
						$('#avisMaster').val('Sans avis');
						$('#avisEcoleIngenieur').val('Sans avis');
					}
					$('#avisModal').modal('show');
				},
				error: function(jqXHR, textStatus, errorThrown){
					
				}
			});
		});
	}

	updateProcess() {
		const selectedStudentId = $('.student').val();
		const avisMaster = $('#avisMaster').val();
		const avisEcoleIngenieur = $('#avisEcoleIngenieur').val();
		const comment = $('#commentaire').val();
	
		const requestData = {
			id_etu: Number(selectedStudentId),
			avis_master: avisMaster,
			avis_inge: avisEcoleIngenieur,
			commentaire: comment
		};
	
		$.ajax({
			url: 'http://localhost:8000/api/updateAvis',
			type: 'PUT',
			dataType: 'json',
			data: JSON.stringify([requestData]),
			success: (data) => {
				$('#avisModal').modal('hide');
				this.verifyStudentInListAvis();
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.error("Error updating avis:", textStatus, errorThrown);
			}
		});
	}

	addProcess() {
		const selectedStudentId = $('.student').val();
		const avisMaster = $('#avisMaster').val();
		const avisEcoleIngenieur = $('#avisEcoleIngenieur').val();
		const comment = $('#commentaire').val();

		const requestData = {
			id_etu: selectedStudentId,
			avis_master: avisMaster,
			avis_inge: avisEcoleIngenieur,
			commentaire: comment
		};

		$.ajax({
			url: 'http://localhost:8000/api/addAvis',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify([requestData]),
			success: (data) => {
				$('#avisModal').modal('hide');
				this.verifyStudentInListAvis();
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.error("Error adding avis:", textStatus, errorThrown);
			}
		});
	}

	setupSubmitListener() {
		const addAvisButton = document.getElementById('addAvis');
		
		addAvisButton.addEventListener('click', () => {
			const selectedStudentId = $('.student').val();
	
			$.ajax({
				url: 'http://localhost:8000/api/avis',
				type: 'GET',
				dataType: 'json',
				success: (data) => {
					const avisExists = data.some(avis => avis.id_etu === parseInt(selectedStudentId));
					if (avisExists) {
						console.log('update');
						this.updateProcess();
					} else {
						console.log('add');
						this.addProcess();
					}
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.error("Error checking student's avis:", textStatus, errorThrown);
				}
			});
		});
	}
}

const exportInstance = new Export('.settings', '.settings-panel');