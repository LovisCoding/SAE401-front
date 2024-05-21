$(document).ready(function() {
	function exportData() {
		var selectedSemester = $("#semester").val();

		var titleRow = ["BUT INFORMATIQUE SEMESTRE " + selectedSemester + " " + $('.form-control option:nth-last-child(1)').text()];
		var headers = ["code_nip", "Rg", "Nom", "Prénom", "Parcours", "Cursus", "UEs", "Moyenne"];

		// Récupérer les données des compétences une seule fois
		$.ajax({
			url: 'http://localhost:8000/api/competence',
			type: 'GET',
			dataType: 'json',
			success: function(competenceData) {
				competenceData.forEach(function(competence) {
					headers.push(competence.label);
				});

				var data = [titleRow, headers];

				// Récupérer les données des étudiants une seule fois
				$.ajax({
					url: 'http://localhost:8000/api/etudiant',
					type: 'GET',
					dataType: 'json',
					success: function(students) {
						students.forEach(function(student) {
							// Récupérer les données du semestre pour chaque étudiant
							$.ajax({
								url: 'http://localhost:8000/api/etuSemestre/' + student.id_etu,
								type: 'GET',
								dataType: 'json',
								success: function(semestreData) {
									// Récupérer les données des compétences pour chaque étudiant
									$.ajax({
										url: 'http://localhost:8000/api/etuComp/' + student.id_etu,
										type: 'GET',
										dataType: 'json',
										success: function(compData) {
											var competencesValides = compData.filter(function(data) {
												return data.moyenne_comp > 10;
											}).length;

											var studentRow = [
												student.code_etu,
												(semestreData.length > 0 && semestreData[0].rang) || '',
												student.nom_etu,
												student.prenom_etu,
												"A",
												student.cursus,
												competencesValides + "/" + competenceData.length,
												(semestreData.length > 0 && semestreData[0].moyenne) || ''
											];

											competenceData.forEach(function(competence) {
												var associatedData = compData.find(function(data) {
													return data.id_comp === competence.id_comp;
												});

												studentRow.push(associatedData ? associatedData.moyenne_comp : '');
											});

											data.push(studentRow);

											if (data.length - 1 === students.length) {
												createExcel(data);
											}
										},
										error: function(jqXHR, textStatus, errorThrown) {
											
										}
									});
								},
								error: function(jqXHR, textStatus, errorThrown) {
									
								}
							});
						});
					},
					error: function(jqXHR, textStatus, errorThrown) {
						
					}
				});
			},
			error: function(jqXHR, textStatus, errorThrown) {
				
			}
		});
	}

	function createExcel(data) {
		var ws = XLSX.utils.aoa_to_sheet(data);
		var wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Etudiants");
		XLSX.writeFile(wb, "Jury.xlsx");
	}

	$("#exportFile").click(exportData);
});