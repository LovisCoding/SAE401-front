// Méthode permettant de renvoyer vers la bonne méthode selon le choix de l'utilisateur

function exportData() {
	const radioChecked = document.querySelector('input[name="juryCommission"]:checked');
	const semestre = $("#semester").val();

	if (radioChecked.value == "jury") {
		exportJury(semestre)
	} else {
		exportCommission(semestre);
	}
}

// Méthode permettant d'exporter les données de la commission

async function exportCommission(semestre) {
	let data = [];
	data.push(["BUT INFORMATIQUE "]);
	data.push([semestre]);
	data.push([localStorage.getItem('labelCurrentYear')])
	data.push([]);
	const idAnnee = localStorage.getItem('currentYear');

	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, semestre);
	let lstCompetences = await getCompetencesByIdSemestre(idSemestre);
	let lstCoefficients = await getCoefficients();

	// Récupération des entetes

	let lstEntetes = ["Code nip", "Rang", "Nom", "Prenom", "Cursus", "UEs", "Moy"];
	let lstCoeffAffiche = ["", "", "", "", "", "", ""];

	for (let i = 0; i < lstCompetences.length; i++) {

		lstEntetes.push(lstCompetences[i].label);
		lstEntetes.push("Bonus " + lstCompetences[i].label);

		lstCoeffAffiche.push("");
		lstCoeffAffiche.push("");

		let idComp = lstCompetences[i].id_comp;
		let lstCoefficientsByComp = lstCoefficients.filter(item => item.id_comp == idComp);

		for (let i = 0; i < lstCoefficientsByComp.length; i++) {
			lstCoeffAffiche.push(lstCoefficientsByComp[i].coef);
			let module = await getModuleById(lstCoefficientsByComp[i].id_module);
			lstEntetes.push(module.label);
		}
	}

	data.push(lstEntetes);
	data.push(lstCoeffAffiche);

	// Récupération et traitement des étudiants

	let lstEtudiants = await getEtudiantsByIdSemestre(idSemestre);
	let lstEtuComp = await getEtuComp();
	let lstEtuModule = await getEtuModule();

	for (let i = 0; i < lstEtudiants.length; i++) {
		let lstEtudiantAffiche = [];
		let lstInfoEtudiant = [];
		let lstNoteEtudiant = [];
		let etudiant = lstEtudiants[i];
		
		// Info de l'étudiant

		lstInfoEtudiant.push(etudiant.code_etu);
		lstInfoEtudiant.push(i + 1);
		lstInfoEtudiant.push(etudiant.nom_etu);
		lstInfoEtudiant.push(etudiant.prenom_etu);
		lstInfoEtudiant.push(etudiant.cursus);

		// Note de l'étudiant

		lstNoteEtudiant.push(etudiant.moyenne);

		var totalComp = 0;
		let cptUEReussie = 0;

		for (let i = 0; i < lstCompetences.length; i++) {
			let idComp = lstCompetences[i].id_comp;
			let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];

			if (!etuComp) {
				break;
			}

			lstNoteEtudiant.push(etuComp.moyenne_comp);

			if (etuComp.bonus == 0 ) {
				lstNoteEtudiant.push("");
			} else {
				lstNoteEtudiant.push(etuComp.bonus);
			}

			if (etuComp.moyenne_comp >= 10) {
				cptUEReussie ++;
			}

			let lstCoefficientsByComp = lstCoefficients.filter(item => item.id_comp == idComp);
		
			for (let i = 0; i < lstCoefficientsByComp.length; i++) {
				let idCoeff = lstCoefficientsByComp[i].id_coef;
				let etuModule = lstEtuModule.filter(item => item.id_coef == idCoeff && item.id_etu == etudiant.id_etu)[0];
				if (etuModule) {
					if (etuModule.note == -1) {
						lstNoteEtudiant.push("~");
					} else {
						lstNoteEtudiant.push(etuModule.note);
					}
				}
				else {
					lstNoteEtudiant.push("");
				}
			}
		}

		lstInfoEtudiant.push(cptUEReussie + "/" + lstCompetences.length);
		lstInfoEtudiant.forEach(element => lstEtudiantAffiche.push(element));
		lstNoteEtudiant.forEach(element => lstEtudiantAffiche.push(element));

		data.push(lstEtudiantAffiche);
	}

	let nomFichier = "Commission_" + semestre.replace(" ", "_") + "_" + localStorage.getItem('labelCurrentYear') + ".xlsx";

	createExcel(data, nomFichier);
}

// Méthode permettant d'exporter les données du jury

async function exportJury(semestre) {
	let data = [];
	data.push(["BUT INFORMATIQUE "]);
	data.push([semestre]);
	data.push([localStorage.getItem('labelCurrentYear')])
	data.push([]);
	const idAnnee = localStorage.getItem('currentYear');

	const match = semestre.match(/\d+/);
	const numSemestre = match ? parseInt(match[0]) : null;
	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, semestre);
	var lstEntetes = [];

	if (numSemestre !== 1) {
		lstEntetes = ["Code nip", "Rang", "Nom", "Prenom","Pacours", "Cursus","UEs", "Moy"];
		for (let i = 0; i < (numSemestre-1)/2 -1 ; i++) { 
			lstEntetes.push("C1");
			lstEntetes.push("C2");
			lstEntetes.push("C3");
			lstEntetes.push("C4");
			lstEntetes.push("C5");
			lstEntetes.push("C6");
		}
		if (numSemestre !== 6) {
			lstEntetes.push("C1");
			lstEntetes.push("C2");
			lstEntetes.push("C3");
			lstEntetes.push("C4");
			lstEntetes.push("C5");
			lstEntetes.push("C6");
		} else {
			lstEntetes.push("C1");
			lstEntetes.push("C2");
			lstEntetes.push("C3");
		}
	} else {
		lstEntetes = ["Code nip", "Rang", "Nom", "Prenom", "Pacours", "Cursus","UEs","Moy" ,"C1", "C2", "C3"];
		if (numSemestre !== 5 && numSemestre !== 6) {
			lstEntetes.push("C4");
			lstEntetes.push("C5");
			lstEntetes.push("C6");
		}
	}

	let lstCompetences = await getCompetencesByIdSemestre(idSemestre);

	if (numSemestre % 2 == 0) {
		
		var labelSemestre = "Semestre " + (numSemestre - 1);
		var idSemestre1 = await getIdSemestreByIdAnneeAndLabel(idAnnee, labelSemestre);
		let lstCompetencesSem1 = await getCompetencesByIdSemestre(idSemestre1);
		
		for (let i = 0; i < lstCompetences.length; i++) {
			
			if (!lstCompetencesSem1[i] || !lstCompetences[i]) {
				break;
			}

			lstEntetes.push(lstCompetencesSem1[i].label+ "" + lstCompetences[i].label);
		}

		lstEntetes.push("Décision");
	} else {
		lstCompetences.forEach(comp => {
			lstEntetes.push(comp.label);
		});
	}

	data.push(lstEntetes);

	let lstEtudiants = await getEtudiantsByIdSemestre(idSemestre);
	let lstEtuComp = await getEtuComp();
	let lstEtuSemestre = await getEtuSemestre();

	let lstSemestres = await getSemestres();
	let lstAllCompetences = await getCompetences();

	let lstImport = [];

	for (let i = 0; i < lstEtudiants.length; i++) {
		let lstEtudiantAffiche = [];
		let lstInfoEtudiant = [];
		let lstNoteEtudiant = [];
		let etudiant = lstEtudiants[i];
		
		// Info de l'étudiant
		lstInfoEtudiant.push(etudiant.code_etu);
		lstInfoEtudiant.push(etudiant.nom_etu);
		lstInfoEtudiant.push(etudiant.prenom_etu);
		lstInfoEtudiant.push("A");
		lstInfoEtudiant.push(etudiant.cursus);

		// Note de l'étudiant

		// Il faut gérer les compétences obtenues lors du précédent semestre / lors de la précédente année

		if (numSemestre !== 2) {
			if (idAnnee - 1 < 1 ) {
				for (let i = 0; i < 6; i++) {
					lstNoteEtudiant.push("");
				}
				if (numSemestre == 5 || numSemestre == 6) {
					if (idAnnee - 2 < 1 ) {
						for (let i = 0; i < 6; i++) {
							lstNoteEtudiant.push("");
						}
					}
				}
			} else {
				var labelAncienSemestre = "Semestre 2";
				if (numSemestre == 5 || numSemestre == 6) {
					if (idAnnee - 2 < 1 ) {
						for (let i = 0; i < 6; i++) {
							lstNoteEtudiant.push("");
						}
					} else {
						let idSemestreAncien = lstSemestres.filter(item => item.id_annee == idAnnee - 2 && item.label == labelAncienSemestre)[0].id_semestre;
						let lstAncienneComp = lstAllCompetences.filter(item => item.id_semestre == idSemestreAncien);
						if (lstAncienneComp) {
							for (let i = 0; i < lstAncienneComp.length; i++) {
								let idComp = lstAncienneComp[i].id_comp;
								let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];
								if (etuComp) {
									lstNoteEtudiant.push(etuComp.passage);
								} else {
									lstNoteEtudiant.push("");
								}
							}
						}
						else {
							for (let i = 0; i < 6; i++) {
								lstNoteEtudiant.push("");
							}
						}
					}
					labelAncienSemestre = "Semestre 4";
				}
	
				let idSemestreAncien = lstSemestres.filter(item => item.id_annee == idAnnee - 1 && item.label == labelAncienSemestre)[0].id_semestre;
				let lstAncienneComp = lstAllCompetences.filter(item => item.id_semestre == idSemestreAncien);

				for (let i = 0; i < lstAncienneComp.length; i++) {
					let idComp = lstAncienneComp[i].id_comp;
					let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];
					if (etuComp) {
						lstNoteEtudiant.push(etuComp.passage);
					} else {
						lstNoteEtudiant.push("");
					}
				}
			}
		}
		
		// Si le semestre est pair, on affiche le détail des compétences acquises dans l'année

		if (numSemestre % 2 == 0) {
			for (let i = 0; i < lstCompetences.length; i++) {
				let idComp = lstCompetences[i].id_comp;
				let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];
				if (!etuComp){
					lstNoteEtudiant.push("");
				} else {
					lstNoteEtudiant.push(etuComp.passage);
				}
			}
		}

		var totalComp = 0.0;
		let cptUEReussie = 0;
		var totalComp = 0;

		for (let i = 0; i < lstCompetences.length; i++) {
			let idComp = lstCompetences[i].id_comp;
			let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];

			if (!etuComp) {
				lstNoteEtudiant.push("");
			} else {
				var moyenne_comp = etuComp.moyenne_comp;

				if (numSemestre%2 == 0) {
					var labelSemestre = "Semestre " + (numSemestre - 1);
					let idSemestre1 = lstSemestres.filter(item => item.id_annee == idAnnee && item.label == labelSemestre)[0].id_semestre;
					let lstCompetencesSem1 = lstAllCompetences.filter(item => item.id_semestre == idSemestre1);
					let idCompSem1 = lstCompetencesSem1[i].id_comp;
					let etuCompSem1 = lstEtuComp.filter(item => item.id_comp == idCompSem1 && item.id_etu == etudiant.id_etu)[0];
					moyenne_comp = (Number(Number(etuCompSem1.moyenne_comp) + Number(moyenne_comp)) / 2).toFixed(2);
				}

				lstNoteEtudiant.push(moyenne_comp);
				totalComp = totalComp + Number(moyenne_comp);

				if (moyenne_comp >= 10) {
					cptUEReussie ++;
				}
			}
		}

		if (numSemestre%2 == 0) {
			let etuSemestre = lstEtuSemestre.filter(item => item.id_etu == etudiant.id_etu && item.id_semestre == idSemestre)[0];
			lstNoteEtudiant.push(etuSemestre.validation);
		}

		lstInfoEtudiant.push(cptUEReussie + "/" + lstCompetences.length);

		lstInfoEtudiant.forEach(element => lstEtudiantAffiche.push(element));

		if (numSemestre !== 5 && numSemestre !== 6) {
			lstEtudiantAffiche.push(Number(totalComp/6).toFixed(2))
		} else {
			lstEtudiantAffiche.push(Number(totalComp/3).toFixed(2))
		}
		
		lstNoteEtudiant.forEach(element => lstEtudiantAffiche.push(element));
		lstImport.push(lstEtudiantAffiche)
	}

	lstImport.sort((a, b) => {
		return parseFloat(b[6]) - parseFloat(a[6]);
	});

	for (let i = 0; i < lstImport.length; i++) {
		let lstEtudiantAffiche = lstImport[i];
		lstEtudiantAffiche.splice(1, 0, i+1);
		data.push(lstEtudiantAffiche);
	}

	let nomFichier = "Jury_" + semestre.replace(" ", "_") + "_" + localStorage.getItem('labelCurrentYear') + ".xlsx";

	createExcel(data, nomFichier);
}

// Méthode permettant de générer un fichier Excel

function createExcel(data, nomFichier) {
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) {
			let cellValue = data[i][j];
			if (cellValue !== "" && !isNaN(cellValue)) {
				data[i][j] = parseFloat(cellValue);
			}
		}
	}

	// Créer la feuille de calcul

	var ws = XLSX.utils.aoa_to_sheet(data);
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Etudiants");

	// Écrire le fichier Excel

	XLSX.writeFile(wb, nomFichier);
}

// Événement permettant de lancer l'export des données

$("#exportFile").click(exportData);
















async function getIdSemestreByIdAnneeAndLabel(idAnnee, label) {
	try {
		const response = await fetch(`http://localhost:8000/api/semestre`);
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const semestre = data.find(item => item.label == label && item.id_annee == idAnnee);
			if (semestre) {
				return semestre.id_semestre; // Retourner l'ID du semestre s'il existe
			}
		}
		return -1; // Retourner -1 si le semestre n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2; // Retourner -2 en cas d'erreur
	}
}

async function getCompetencesByIdSemestre(idSemestre) {
	try {
		const response = await fetch(`http://localhost:8000/api/competence`);	
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const competences = data.filter(item => item.id_semestre == idSemestre);
			competences.sort((a, b) => a.id_competence - b.id_competence);
			return competences; 
		}
		return []; // Retourner une liste vide si aucune compétence n'est trouvée
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function getCoefficients() {
	try {
		const response = await fetch(`http://localhost:8000/api/coefficient`);	
		const data = await response.json();

		if (data && Array.isArray(data)) {
			data.sort((a, b) => a.id_coef - b.id_coef);
			return data; 
		}
		return []; // Retourner une liste vide si aucune compétence n'est trouvée
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function getModuleById(idModule) {
	try {
		const response = await fetch(`http://localhost:8000/api/module/${idModule}`);	
		const modules = await response.json();

		if (modules.length === 0) {
			return 0;
		}
	
		return modules[0];

	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function getEtudiantsByIdSemestre(idSemestre) {
	try {
		const response = await fetch(`http://localhost:8000/api/etuSemestre`);	
		const data = await response.json();

		const lstEtudiants = await getEtudiants();
		const lstEtuTrie = []

		if (data && Array.isArray(data)) {
			const etuSemestres = data.filter(item => item.id_semestre == idSemestre);
			etuSemestres.sort((a, b) => b.moyenne - a.moyenne);
			etuSemestres.forEach(element => {
				const etudiant = lstEtudiants.find(item => item.id_etu == element.id_etu);
				if (etudiant) {
					etudiant.moyenne = element.moyenne;
					lstEtuTrie.push(etudiant);
				}
			});

		}
		return lstEtuTrie; // Retourner une liste vide si aucune compétence n'est trouvée
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function getEtudiants() {
	try {
		const response = await fetch(`http://localhost:8000/api/etudiant`);	
		const data = await response.json();

		if (data) {
			return data; 
		}
		return []; // Retourner une liste vide si aucune compétence n'est trouvée
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function getEtuModule() {
	try {
		const response = await fetch(`http://localhost:8000/api/etuModule`);	
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


async function getEtuSemestre() {
	try {
		const response = await fetch(`http://localhost:8000/api/etuSemestre`);	
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

async function getEtuComp() {
	try {
		const response = await fetch(`http://localhost:8000/api/etuComp`);	
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


async function getSemestres() {
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

async function getCompetences() {
	try {
		const response = await fetch(`http://localhost:8000/api/competence`);	
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

async function getModules() {
	try {
		const response = await fetch(`http://localhost:8000/api/module`);	
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