class Year {

	// Déclaration du constructeur

	constructor() {
		this.loadYears();
		this.setEventListeners();
	}

	// Méthode pour ajouter les écouteurs d'événements

	setEventListeners() {
		$('.form-control').change(function(){
			var idAnnee = $(this).val();
			localStorage.setItem('currentYear', idAnnee);
		});
	// Méthode pour charger les années
	}
	loadYears() {
		$.ajax({
			url: 'http://localhost:8000/api/annee',
			type: 'GET',
			dataType: 'json',
			success: function(data){
				console.log(data);
				$.each(data, function(index, annee){
					if (annee.id_annee == localStorage.getItem('currentYear')) {
						$('#ddlYear').append('<option value="' + annee.id_annee + '" selected>' + annee.annee + '</option>');
					} else {
						$('#ddlYear').append('<option value="' + annee.id_annee + '">' + annee.annee + '</option>');
					}
				});
			},
			error: function(jqXHR, textStatus, errorThrown){
				
			}
		});
	}

	// Méthode pour ajouter une année

	addYear() {
		$('#ddlYear').after('<button id="addYearBtn" class="btn btn-primary">Ajouter</button>');

		$(document).on('click', '#addYearBtn', function(){
			var beforeLastYear = $('#ddlYear option:nth-last-child(1)').text();
			var yearParts = beforeLastYear.split('-');
			var startYear = parseInt(yearParts[0]) + 1;
			var endYear = parseInt(yearParts[1]) + 1;
			var newYear = startYear + '-' + endYear;
			

			$.ajax({
				url: 'http://localhost:8000/api/addAnnee',
				type: 'POST',
				dataType: 'json',
				data: JSON.stringify([{ annee: newYear }]),
				success: function(data){
					console.log(data);
					$('#ddlYear').append('<option value="' + data.id_annee + '">' + data.annee + '</option>');
				},
				
				error: function(jqXHR, textStatus, errorThrown){
					
				}
			});
		});
	}
}

// Instanciation de la classe Year

const year = new Year();
year.addYear();