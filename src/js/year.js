class Year {

	// Déclaration du constructeur

	constructor() {
		this.loadYears();
	}

	// Méthode pour charger les années

	loadYears() {
		$.ajax({
			url: 'http://localhost:8000/api/annee',
			type: 'GET',
			dataType: 'json',
			success: function(data){
				$.each(data, function(index, annee){
					$('.form-control').append('<option value="' + annee.id_annee + '">' + annee.annee + '</option>');
				});
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('Erreur : ' + errorThrown);
			}
		});
	}

	// Méthode pour ajouter une année

	addYear() {
		$('.form-control').after('<button id="addYearBtn" class="btn btn-primary">Ajouter</button>');

		$(document).on('click', '#addYearBtn', function(){
			// prendre le dernier élément de la liste
			var beforeLastYear = $('.form-control option:nth-last-child(1)').text();
			var yearParts = beforeLastYear.split('-');
			var startYear = parseInt(yearParts[0]) + 1;
			var endYear = parseInt(yearParts[1]) + 1;
			var newYear = startYear + '-' + endYear;
			console.log(newYear);

			$.ajax({
				url: 'http://localhost:8000/api/addAnnee',
				type: 'POST',
				dataType: 'json',
				data: JSON.stringify([{ annee: newYear }]),
				success: function(data){
					$('.form-control').append('<option value="' + data.id_annee + '">' + data.annee + '</option>');
				},
				
				error: function(jqXHR, textStatus, errorThrown){
					console.log('Erreur : ' + errorThrown);
				}
			});
		});
	}
}

// Instanciation de la classe Year

const year = new Year();
year.addYear();