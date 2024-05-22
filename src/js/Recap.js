class Recap {
    // Déclaration du constructeur
    constructor() {
        const idAnnee = localStorage.getItem('currentYear');
        loadSemestre(idAnnee);

        this.setupListeners();

        this.lstRowIndex = [];
        this.lstColIndex = [];
        this.lstNewValue = [];
        this.lstRow = [];
        this.lstHeaders = [];

    }

    loadTableau(semestre, type) {
        this.resetTable();
        if (type == "Commission") {
            afficherCommission(semestre);
        } else {
            afficherJury(semestre);
        }
    }

    setupListeners() {
        const selectElement = document.getElementById('semester');
        const radioButtons = document.querySelectorAll('input[name="type"]');

        // Écouteur pour le changement du menu déroulant
        selectElement.addEventListener('change', () => {
            const selectedSemestre = selectElement.options[selectElement.selectedIndex].text;
            const selectedType = document.querySelector('input[name="type"]:checked + label').textContent;
            this.loadTableau(selectedSemestre, selectedType);
        });

        // Écouteurs pour le changement des boutons radio
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const selectedSemestre = selectElement.options[selectElement.selectedIndex].text;
                const selectedType = document.querySelector('input[name="type"]:checked + label').textContent;
                this.loadTableau(selectedSemestre, selectedType);
            });
        });
    }

    resetTable() {
        const table = document.getElementById('tableau');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Vider le contenu des éléments <thead> et <tbody>
        thead.innerHTML = '';
        tbody.innerHTML = '';
    }

    makeTableEditable() {
        const table = document.getElementById('tableau');
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');

        // Identifiez les index des colonnes à rendre éditables
        const editableColumns = [];
        headers.forEach((header, index) => {
            const headerText = header.textContent.trim();
			let labelEditable = ["Prenom", "Nom", "Cursus"]
            if (labelEditable.includes(headerText) || headerText.startsWith("Bonus")   || headerText.startsWith("BINR")  || headerText.startsWith("BINS")) {
                editableColumns.push(index);
            }
        });

        headers.forEach(element => {
            this.lstHeaders.push(element.innerHTML);
        });

        // Ajoutez des écouteurs d'événements aux cellules des colonnes éditables
        rows.forEach((row, rowIndex) => {
            row.querySelectorAll('td').forEach((cell, colIndex) => {
                if (editableColumns.includes(colIndex)) {
                    cell.addEventListener('click', () => {
                        if (cell.querySelector('input')) return;

                        const currentText = cell.textContent;
                        cell.innerHTML = '';

                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = currentText;
                        cell.appendChild(input);
                        input.focus();

                        input.addEventListener('blur', () => {
                            const newValue = input.value;
                            cell.textContent = newValue;
                            this.lstRowIndex.push(rowIndex);
                            this.lstColIndex.push(colIndex);
                            this.lstNewValue.push(newValue);
                            this.lstRow.push(row);
                        });

                        input.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                input.blur();
                            }
                        });
                    });
                }
            });
        });

		if (localStorage.getItem('isadmin')) {
			let btnValider = document.getElementById("btnValider")
			btnValider.addEventListener("click",this.updateValuesBeforeUnload.bind(this));
		}
		
    }

    async updateValuesBeforeUnload(event) {
		if (!this.lstRowIndex || !this.lstColIndex || !this.lstNewValue || !this.lstRow || !this.lstHeaders) {
			return;
		}
        await updateValue(this.lstRowIndex, this.lstColIndex, this.lstNewValue, this.lstRow, this.lstHeaders);

		this.resetTable();

		const selectElement = document.getElementById('semester');
		const radioButtons = document.querySelectorAll('input[name="type"]');

		const selectedSemestre = selectElement.options[selectElement.selectedIndex].text;
		const selectedType = document.querySelector('input[name="type"]:checked + label').textContent;
		this.loadTableau(selectedSemestre, selectedType);
    }

}

const recapInstance = new Recap();

async function updateValue(lstRowIndex, lstColIndex, lstNewValue, lstRow, lstHeaders) {
	if (!lstRowIndex || !lstColIndex || !lstNewValue || !lstRow || !lstHeaders) {
		return;
	}

	let lstCompetences = await getCompetences();
	let lstModules = await getModules();
	let lstCoefficients = await getCoefficients();
	let lstEtuModule = await getEtuModule();
	let lstEtuComp = await getEtuComp();
	let lstEtudiants = await getEtudiants();

	for (let i = 0; i < lstRowIndex.length; i++) {
		let rowIndex = lstRowIndex[i];
		let colIndex = lstColIndex[i];
		let newValue = lstNewValue[i];
		let row = lstRow[i];

		let colonneHeader = lstHeaders[colIndex];
		if (colonneHeader.startsWith('BINR') || colonneHeader.startsWith('BINS')) {
			let labelComp = "";

			const regex = /^BIN\d{2}/;
			for (let j = 0; j < colIndex; j++) {
				if (regex.test(lstHeaders[j])) {
					labelComp = lstHeaders[j];
				}
			}

			let idComp = lstCompetences.filter(item => item.label == labelComp)[0].id_comp;
			let idModule = lstModules.filter(item => item.label == colonneHeader)[0].id_module;

			if (rowIndex !== 0) {
				let idCoeff = lstCoefficients.filter(item => item.id_comp == idComp && item.id_module == idModule)[0].id_coef;
				let idEtu = Number(row.querySelectorAll('td')[0].textContent);

				let etuModule = lstEtuModule.filter(item => item.id_coef == idCoeff && item.id_etu == idEtu)[0];
				etuModule.note = Number(newValue);

				updateEtuModule(etuModule);
			} else {
				if (idComp && !colonneHeader.startsWith("Prenom") && !colonneHeader.startsWith("Nom") && !colonneHeader.startsWith("Cursus")) {
					let coeff = lstCoefficients.filter(item => item.id_comp == idComp && item.id_module == idModule)[0];
					coeff.coef = Number(newValue);

					updateCoeff(coeff);
				}
			}

		} else if (colonneHeader.startsWith('Bonus')) {
			const labelComp = colonneHeader.slice(-5);
			let idComp = lstCompetences.filter(item => item.label == labelComp)[0].id_comp;
			let idEtu = Number(row.querySelectorAll('td')[0].textContent);

			let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == idEtu)[0];
			etuComp.bonus = Number(newValue);

			updateEtuComp(etuComp);
		} else if (colonneHeader.startsWith("Nom") || colonneHeader.startsWith("Prenom") || colonneHeader.startsWith("Cursus")) {
			if (rowIndex == 0) {
				return;
			}
			let idEtu = Number(row.querySelectorAll('td')[0].textContent);
			let etu = lstEtudiants.filter(item => item.id_etu == idEtu)[0];

			if (colonneHeader.startsWith("Nom")) {
				etu.nom_etu = newValue;
			} else if (colonneHeader.startsWith("Prenom")) {
				etu.prenom_etu = newValue;
			} else {
				etu.cursus = newValue;
			}

			updateEtudiant(etu);
		}
	}
}

async function loadSemestre(idAnnee) {
    let lstSemestres = await getSemestres();
    let semesters = lstSemestres.filter(item => item.id_annee == idAnnee);
    semesters.sort((a, b) => a.label.localeCompare(b.label));
    const selectElement = document.getElementById('semester');

    semesters.forEach(semester => {
        const option = document.createElement('option');
        option.textContent = semester.label;
        selectElement.appendChild(option);
    });

	recapInstance.loadTableau(selectElement.options[selectElement.selectedIndex].text, "Commission")
}


async function afficherCommission(semestre) {
	const idAnnee = localStorage.getItem('currentYear');

	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, semestre);
	let lstCompetences = await getCompetencesByIdSemestre(idSemestre);
	let lstCoefficients = await getCoefficients();

	// Récupération des entetes
	let lstEntetes = ["Code nip", "Rang", "Nom", "Prenom", "Cursus", "UEs", "Moy"]
	let lstCoeffAffiche = ["", "", "", "", "", "", ""]
	for (let i = 0; i < lstCompetences.length; i++) {

		lstEntetes.push(lstCompetences[i].label);
		lstEntetes.push("Bonus " + lstCompetences[i].label);

		lstCoeffAffiche.push("")
		lstCoeffAffiche.push("")

		let idComp = lstCompetences[i].id_comp;

		let lstCoefficientsByComp = lstCoefficients.filter(item => item.id_comp == idComp);

		for (let i = 0; i < lstCoefficientsByComp.length; i++) {
			lstCoeffAffiche.push(lstCoefficientsByComp[i].coef);
			let module = await getModuleById(lstCoefficientsByComp[i].id_module);
			lstEntetes.push(module.label);
		}
	}

	ajouterEntetes(lstEntetes);
	ajouterCoefficients(lstCoeffAffiche);

	// Récupération et traitement des étudiants

	let lstEtudiants = await getEtudiantsByIdSemestre(idSemestre);
	let lstEtuComp = await getEtuComp();
	let lstEtuModule = await getEtuModule();

	for (let i = 0; i < lstEtudiants.length; i++) {
		let lstEtudiantAffiche = []
		let lstInfoEtudiant = []
		let lstNoteEtudiant = []
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
					lstNoteEtudiant.push("")
				}
				
			}
		}

		lstInfoEtudiant.push(cptUEReussie + "/" + lstCompetences.length);

		lstInfoEtudiant.forEach(element =>
			lstEtudiantAffiche.push(element)
		);

		lstNoteEtudiant.forEach(element =>
			lstEtudiantAffiche.push(element)
		);
		ajouterValeurs(lstEtudiantAffiche, lstEntetes, "Commission");
	}

	if (localStorage.getItem('isadmin')) {
		recapInstance.makeTableEditable();
	}

}

async function afficherJury(semestre) {
	const idAnnee = localStorage.getItem('currentYear');

	const match = semestre.match(/\d+/);
	const numSemestre = match ? parseInt(match[0]) : null;
	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, semestre);
	var lstEntetes = []
	if (numSemestre !== 1) {
		lstEntetes = ["Code nip", "Rang", "Nom", "Prenom","Pacours", "Cursus","UEs", "Moy"]
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
		lstEntetes = ["Code nip", "Rang", "Nom", "Prenom", "Pacours", "Cursus","UEs","Moy" ,"C1", "C2", "C3"]
		if (numSemestre !== 5 && numSemestre !== 6) {
			lstEntetes.push("C4");
			lstEntetes.push("C5");
			lstEntetes.push("C6");
		}
	}
	

	let lstCompetences = await getCompetencesByIdSemestre(idSemestre);
	if (numSemestre%2 == 0) {
		
		var labelSemestre = "Semestre " + (numSemestre - 1);
		var idSemestre1 = await getIdSemestreByIdAnneeAndLabel(idAnnee, labelSemestre);
		let lstCompetencesSem1 = await getCompetencesByIdSemestre(idSemestre1);
		
		for (let i = 0; i < lstCompetences.length; i++) {
			
			if (!lstCompetencesSem1[i] || !lstCompetences[i]) {
				break;
			}

			lstEntetes.push(lstCompetencesSem1[i].label+ "" + lstCompetences[i].label);
		}

		lstEntetes.push("Décision")
	} else {
		lstCompetences.forEach(comp => {
			lstEntetes.push(comp.label);
		});
	}

	ajouterEntetes(lstEntetes)

	let lstEtudiants = await getEtudiantsByIdSemestre(idSemestre);
	let lstEtuComp = await getEtuComp();	
	let lstEtuSemestre = await getEtuSemestre();

	let lstSemestres = await getSemestres();
	let lstAllCompetences = await getCompetences();

	for (let i = 0; i < lstEtudiants.length; i++) {
		let lstEtudiantAffiche = []
		let lstInfoEtudiant = []
		let lstNoteEtudiant = []
		let etudiant = lstEtudiants[i];
		
		// Info de l'étudiant
		lstInfoEtudiant.push(etudiant.code_etu);
		lstInfoEtudiant.push(i + 1);
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
						let idSemestreAncien = lstSemestres.filter(item => item.id_annee == idAnnee - 2 && item.label == labelAncienSemestre)[0];
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
	
				let idSemestreAncien = lstSemestres.filter(item => item.id_annee == idAnnee - 1 && item.label == labelAncienSemestre)[0];
				let lstAncienneComp = lstAllCompetences.filter(item => item.id_semestre == idSemestreAncien);

				for (let i = 0; i < lstAncienneComp.length; i++) {
					let idComp = lstAncienneComp[i].id_comp;
					let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];
					lstNoteEtudiant.push(etuComp.passage);
				}
			}
		}
		
		// Si le semestre est pair, on affiche le détail des compétences acquises dans l'année
		if (numSemestre%2 == 0) {
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

		//lstNoteEtudiant.push(etudiant.moyenne);
		var totalComp = 0.0;

		let cptUEReussie = 0;
		var totalComp = 0;

		for (let i = 0; i < lstCompetences.length; i++) {
			let idComp = lstCompetences[i].id_comp;
			let etuComp = lstEtuComp.filter(item => item.id_comp == idComp && item.id_etu == etudiant.id_etu)[0];

			if (!etuComp) {
				lstNoteEtudiant.push("");
			} else {
				var moyenne_comp = etuComp.moyenne_comp

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
			lstNoteEtudiant.push(etuSemestre.validation)
		}

		lstInfoEtudiant.push(cptUEReussie + "/" + lstCompetences.length);

		lstInfoEtudiant.forEach(element =>
			lstEtudiantAffiche.push(element)
		);

		if (numSemestre !== 5 && numSemestre !== 6) {
			lstEtudiantAffiche.push(Number(totalComp/6).toFixed(2))
		} else {
			lstEtudiantAffiche.push(Number(totalComp/3).toFixed(2))
		}
		
		lstNoteEtudiant.forEach(element =>
			lstEtudiantAffiche.push(element)
		);
		ajouterValeurs(lstEtudiantAffiche, lstEntetes, "Jury");
	}

	if (localStorage.getItem('isadmin')) {
		recapInstance.makeTableEditable();
	}

}

function ajouterEntetes(lstEntetes) {
	const tableau = document.getElementById('tableau');

	const newHeaderRow = document.createElement('tr');
	newHeaderRow.classList.add("bleu")
	lstEntetes.forEach(entete => {
		const th = document.createElement('th');
		th.scope = 'col';
		th.textContent = entete;
		newHeaderRow.appendChild(th);
	});

	const thead = tableau.querySelector('thead');
	thead.insertBefore(newHeaderRow, thead.firstChild);
}

function ajouterCoefficients(lstValeurs) {
	const tableau = document.getElementById('tableau');
	const newValueRow = document.createElement('tr');
	newValueRow.classList.add("gris")
	lstValeurs.forEach(valeur => {
		const td = document.createElement('td');
		td.textContent = valeur;
		newValueRow.appendChild(td);
	});
	const tbody = tableau.querySelector('tbody');
	tbody.appendChild(newValueRow);
}

function ajouterValeurs(lstValeurs, lstEntetes, type) {
	const tableau = document.getElementById('tableau');
	const newValueRow = document.createElement('tr');

	var cptValeur = 0;
	lstValeurs.forEach(valeur => {
		const td = document.createElement('td');
		td.textContent = valeur;

		if (lstEntetes[cptValeur].startsWith("UEs")) {
			if (type !== "Jury") {
				if (Number(valeur[2]) == 3) {
					if (Number(valeur[0]) < 2) {
						td.classList.add("rouge");
					} 
				} else {
					if (Number(valeur[0]) <= 4) {
						td.classList.add("rouge");
					}
				}
			} else {
				if (Number(valeur[2]) == 3) {
					if (Number(valeur[0]) < 2) {
						td.classList.add("rouge");
					} else if (Number(valeur[0]) == 3) {
						td.classList.add("vert");
					} else {
						td.classList.add("orange");
					}
				} else {
					if (Number(valeur[0]) < 4) {
						td.classList.add("rouge");
					} else if (Number(valeur[0]) == 6) {
						td.classList.add("vert");
					} else {
						td.classList.add("orange");
					}
				}
				
			}
		}

		if (lstEntetes[cptValeur].startsWith("BIN")) {
			if (Number(valeur) >= 10) {
				td.classList.add("vert");
			}
			else if (Number(valeur) >= 8) {
				td.classList.add("orange");
			}
			else if (Number(valeur) < 8) {
				td.classList.add("rouge");
			}
		}

		if (type == "Jury") {
			let lstAdmission = ["C1", "C2", "C3", "C4", "C5", "C6"]
			if (lstAdmission.includes(lstEntetes[cptValeur])) {
				if (valeur == "ADM") {
					td.classList.add("vert");
				} else if (valeur == "AJ") {
					td.classList.add("rouge");
				} else if (valeur !== "") {
					td.classList.add("orange");
				}
			}
		}
		
		
		cptValeur ++;
		newValueRow.appendChild(td);
	});
	const tbody = tableau.querySelector('tbody');
	tbody.appendChild(newValueRow);
}







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

async function updateEtuModule(etuModule) {
	$.ajax({
		url: 'http://localhost:8000/api/updateEtuModule',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_etu:etuModule.id_etu, id_coef:etuModule.id_coef, note:etuModule.note}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateEtuComp(etuComp) {
	$.ajax({
		url: 'http://localhost:8000/api/updateEtuComp',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_etu:etuComp.id_etu, id_comp:etuComp.id_comp, moyenne_comp:etuComp.moyenne_comp, passage:etuComp.passage, bonus:etuComp.bonus}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateCoeff(coeff) {
	$.ajax({
		url: 'http://localhost:8000/api/updateCoefficient',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_coef:coeff.id_coef, coef:coeff.coef}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateEtudiant(etu) {
	var alternant = etu.alternant ? 1 : 0;
	$.ajax({
		url: 'http://localhost:8000/api/updateEtudiant',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_etu:etu.id_etu, nom_etu:etu.nom_etu, prenom_etu:etu.prenom_etu, groupe_TD:etu.groupe_td, groupe_TP:etu.groupe_tp, cursus:etu.cursus, alternant:alternant}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}