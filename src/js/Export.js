class Export {

	constructor(settingsSelector, settingsPanelSelector) {
		this.settingsImage = document.querySelector(settingsSelector);
		this.settingsPanel = document.querySelector(settingsPanelSelector);
		this.setupListeners();
		this.loadStudent();
		this.setupStudentProcessListener();
		this.setupSubmitListener();
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
					$('.student').append('<option value="' + etudiant.id_etu + '">' + etudiant.nom_etu + ' ' + etudiant.prenom_etu + '</option>');
				});
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('Erreur : ' + errorThrown);
			}
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
					console.log(selectedStudentId);
					console.log(avis);
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
					console.log('Erreur : ' + errorThrown);
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

		console.log(JSON.stringify([requestData]));
	
		$.ajax({
			url: 'http://localhost:8000/api/updateAvis',
			type: 'PUT',
			dataType: 'json',
			data: JSON.stringify([requestData]),
			success: function(data){
				$('#avisModal').modal('hide');
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('Erreur : ' + errorThrown);
			}
		});
	}

	addAvis() {
		$('.student').after('<button id="addAvisBtn" class="btn btn-primary">Ajouter</button>');

		$(document).on('click', '#addAvisBtn', function(){
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
				data: JSON.stringify(requestData),
				success: function(data){
					$('#avisModal').modal('hide');
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log('Erreur : ' + errorThrown);
				}
			});
		});
	}
	
	setupSubmitListener() {
		$('#avisModal .btn-primary').click(() => {
			this.updateProcess();
		});
	}
}

const exportInstance = new Export('.settings', '.settings-panel');