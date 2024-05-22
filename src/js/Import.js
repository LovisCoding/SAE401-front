class Import {

	// Déclaration du constructeur

	constructor() {
		this.btnAddFile = document.getElementById('addFile');
		this.file = document.getElementById('file');
		this.labelFile = document.getElementById('labelito');
		this.iconFile = document.getElementById('validateIcon');
		this.spanTextFile = document.getElementById('spanText');
		this.fileCoeff = document.getElementById('fileCoeff');
		this.loadingFile = document.getElementById('loadingFile');
		
		this.btnAddCoeff = document.getElementById('addFileCoeff');
		this.spanTextCoeff = document.getElementById('spanTextCoeff');
		this.iconCoeff = document.getElementById('validateIcon2');
		this.labelCoeff = document.getElementById('labelitoCoeff')
		this.loadingCoeff = document.getElementById('loadingCoeff');

		this.setupListeners();
		loadInfoImports();
	}

	setupListeners() {
		this.btnAddFile.addEventListener('click', (event) => {
			this.loadingFile.classList.remove('d-none');
			this.btnAddFile.disabled = true;
			const radios = document.getElementsByName('type');
			var type = '';
			radios.forEach(radio => {
				if (radio.checked) {
					type = radio.nextElementSibling.textContent.toLowerCase();
				}
			});

			if (type == "jury") {
				this.importerJury();
			} 
			else {
				this.importerFichier();
			}
			
		});
		this.file.addEventListener('change', () => {
			this.labelFile.style.borderColor = 'green';
			this.iconFile.classList.add('validate')
			this.spanTextFile.innerHTML = this.file.files[0].name;
		});

		this.fileCoeff.addEventListener('change', () => {
			this.labelCoeff.style.borderColor = 'green';
			this.iconCoeff.classList.add('validate')
			this.spanTextCoeff.innerHTML = this.fileCoeff.files[0].name;
		});
		this.btnAddCoeff.addEventListener('click', (event) => {
			this.loadingCoeff.classList.remove('d-none');
			this.btnAddCoeff.disabled = true;
			this.importerCoeff();
			
		});


	}

	importerFichier() {
		const input = document.getElementById('file');
		const fichier = input.files[0];

		if (!fichier) {
			alert("Veuillez sélectionner un fichier Excel.");
			this.loadingFile.classList.add('d-none');
			this.loadingCoeff.classList.add('d-none');
			this.btnAddCoeff.disabled = false;
			this.btnAddFile.disabled = false;
			return;
		}

		const reader = new FileReader();

		reader.onload = function(e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			const enTetesAttendus = ['etudid', 'code_nip', 'Rg', 'Nom', 'Prénom', 'TD', 'TP', 'Cursus', 'Moy', 'Abs'];
			const enTetesFichier = Object.keys(jsonData[0]);

			const enTetesManquants = enTetesAttendus.filter(enTete => !enTetesFichier.includes(enTete));

			if (enTetesManquants.length > 0) {
				document.getElementById('resultat').innerHTML = "Les en-têtes suivants sont manquants dans le fichier Excel: " + enTetesManquants.join(', ');
			} else {
				const entetesAssociatifs = {};
				const enteteModule = [];

				let enteteBIN = null;
				enTetesFichier.forEach(enTete => {
					// Retirer le '_' et tout ce qui vient après
					const cleanEnTete = enTete.replace(/_.*/, '');
					if (/^BIN\d/.test(cleanEnTete)) {
						enteteBIN = cleanEnTete;
						entetesAssociatifs[enteteBIN] = ["Bonus " + enteteBIN];
					} else if (enteteBIN && (cleanEnTete.startsWith('BINR') || cleanEnTete.startsWith('BINS') || cleanEnTete.startsWith('BINP'))) {
						entetesAssociatifs[enteteBIN].push(cleanEnTete);
						if (!enteteModule.includes(cleanEnTete)) {
							enteteModule.push(cleanEnTete);
						}
					}
				});

				ajouterCompetencesEtModules(jsonData, entetesAssociatifs, enteteModule, enTetesAttendus, fichier);

				// Ajout des compétences dans la BD

			}
		};

		reader.readAsArrayBuffer(fichier);
	}

	importerJury() {

		const input = document.getElementById('file');
		const fichier = input.files[0];

		if (!fichier) {
			alert("Veuillez sélectionner un fichier Excel.");
			this.loadingFile.classList.add('d-none');
			this.loadingCoeff.classList.add('d-none');
			this.btnAddCoeff.disabled = false;
			this.btnAddFile.disabled = false;
			return;
		}

		const reader = new FileReader();

		reader.onload = function(e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			const enTetesAttendus = ['etudid', 'code_nip', 'Rg', 'Nom', 'Prénom', 'TD', 'TP', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'Année'];
			const enTetesFichier = Object.keys(jsonData[0]);

			const enTetesManquants = enTetesAttendus.filter(enTete => !enTetesFichier.includes(enTete));

			if (enTetesManquants.length > 0) {
				alert("entetes manquants " + enTetesManquants);
				this.loadingFile.classList.add('d-none');
				this.loadingCoeff.classList.add('d-none');
				this.btnAddCoeff.disabled = false;
				this.btnAddFile.disabled = false;
			} else {
				ajouterJuryDonnees(jsonData, fichier);
			}

		};

		reader.readAsArrayBuffer(fichier);
		
	}

	importerCoeff() {

		const input = document.getElementById('fileCoeff');
		const fichier = input.files[0];

		if (!fichier) {
			alert("Veuillez sélectionner un fichier Excel.");
			this.loadingFile.classList.add('d-none');
			this.loadingCoeff.classList.add('d-none');
			this.btnAddCoeff.disabled = false;
			this.btnAddFile.disabled = false;
			return;
		}

		const reader = new FileReader();

		reader.onload = function(e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			const enTetesAttendus = ["BIN", "C1", "C2", "C3", "C4", "C5", "C6"];
			const enTetesFichier = Object.keys(jsonData[0]);

			const enTetesManquants = enTetesAttendus.filter(enTete => !enTetesFichier.includes(enTete));

			if (enTetesManquants.length > 0) {
				alert("entetes manquants " + enTetesManquants);
				this.loadingFile.classList.add('d-none');
				this.loadingCoeff.classList.add('d-none');
				this.btnAddCoeff.disabled = false;
				this.btnAddFile.disabled = false;
			} else {
				ajouterCoeff(jsonData, fichier);
			}

		};

		reader.readAsArrayBuffer(fichier);
	}

}

const importInstance = new Import();

async function ajouterCoeff(jsonData, fichier) {
	const idAnnee = $(".form-control").val();

	var lstCompFichier = ["C1", "C2", "C3", "C4", "C5", "C6"]

	const lstIdSemestre = await getLstSemestreByIdAnnee(idAnnee);	
	var cptIdSemestre = 0;
	var lstCompImport = await getCompetencesByIdSemestre(lstIdSemestre[cptIdSemestre].id_semestre);


	for (const element of jsonData) {
		if (/^BINR\d01$/.test(element.BIN)) {

			if (lstIdSemestre[cptIdSemestre] == null) {
				break;
			}

			lstCompImport = await getCompetencesByIdSemestre(lstIdSemestre[cptIdSemestre].id_semestre);

			if (lstCompImport.length === 0) {
				break;
			}

			cptIdSemestre++;
		}
		
		for (let i = 0; i < lstCompFichier.length; i++) {
			let labelComp = lstCompFichier[i];
			var idComp = lstCompImport[i].id_comp
			var idMod = await getIdModuleByLabel(element.BIN);

			var idCoeff = await getIdCoeffByModAndComp(idComp, idMod);
			var coeff = element[labelComp];

			if (coeff !== "" && coeff !== null) {
				updateCoeff(idCoeff, Number(coeff));
			}
			
		}

		cptIdSemestre ++;
	}
	
	const idFichier = await getFichierByAnneeAndSemestreAndType(idAnnee, 1, "coefficient");
	if (idFichier) {
		await updateFichier(idFichier, fichier.name)
	}
	else {
		await ajouterFichier(fichier.name, "coefficient", 1, idAnnee)
	}

	loadInfoImports();

}

async function ajouterJuryDonnees(jsonData, fichier) {
	const idAnnee = $(".form-control").val();

	const isChecked = document.getElementById('alternant').checked;
	const alternant = isChecked ? 1 : 0;

	var selectElement = document.getElementById("semester");
	var selectedOption = selectElement.options[selectElement.selectedIndex];
	var lblSem = selectedOption.text;

	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, lblSem);

	if (idSemestre == -1) {
		alert("Veuillez importer les moyennes de ce semestre avant !");
		this.loadingFile.classList.add('d-none');
		this.loadingCoeff.classList.add('d-none');
		this.btnAddCoeff.disabled = false;
		this.btnAddFile.disabled = false;
	}
	etuSemestre = []

	const lstCompImport = await getCompetencesByIdSemestre(idSemestre);

	if (lstCompImport.length == 0) {
		alert("Veuillez importer les moyennes de ce semestre avant !");
		this.loadingFile.classList.add('d-none');
		this.loadingCoeff.classList.add('d-none');
		this.btnAddCoeff.disabled = false;
		this.btnAddFile.disabled = false;
	}

	
    for (const element of jsonData) {
		const codeEtu = Number(element.etudid);
		var idEtu = codeEtu

        // Attendre l'ajout de l'étudiant et récupérer l'id de l'étudiant
        updateEtudiant(idEtu, {
            code_etu: codeEtu, nom_etu: element.Nom, prenom_etu: element.Prénom, groupe_TD: element.TD, groupe_TP: element.TP, cursus: element.Cursus, alternant: alternant
        }); 

		updateValidationEtuSemestre(idEtu, idSemestre, element.Année);

		const labelSemestre = "" + await getLabelSemestreById(idSemestre);
		const match = labelSemestre.match(/\d+/);
		const numSemestre = match ? parseInt(match[0]) : null;

		var lstCompFichier = ["C1", "C2", "C3", "C4", "C5", "C6"]

		for (let i = 0; i < lstCompFichier.length; i++) {
			let compLabel = lstCompFichier[i];
			if (numSemestre % 2 == 0) {
				updatePassageEtuComp(idEtu, lstCompImport[i].id_comp, element[compLabel + "_1"]);
			} else {
				updatePassageEtuComp(idEtu, lstCompImport[i].id_comp, element[compLabel]);
			}
		}
		
	}

	ajouterLogoFichier(fichier.name)
	this.loadingFile.classList.add('d-none');
	this.btnAddFile.disabled = false;
}

async function ajouterLogoFichier(fileInput) {
	const idAnnee = $(".form-control").val();

	var selectElement = document.getElementById("semester");
	var selectedOption = selectElement.options[selectElement.selectedIndex];
	var lblSem = selectedOption.text;
	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, lblSem);

	const radios = document.getElementsByName('type');

	var type = '';
	radios.forEach(radio => {
		if (radio.checked) {
			type = radio.nextElementSibling.textContent.toLowerCase();
		}
	});

	const isChecked = document.getElementById('alternant').checked;

	if (isChecked) {
		type = type + "alternant"
	}


	const idFichier = await getFichierByAnneeAndSemestreAndType(idAnnee, idSemestre, type);
	if (idFichier) {
		await updateFichier(idFichier, fileInput)
	}
	else {
		await ajouterFichier(fileInput, type, idSemestre, idAnnee)
	}

	loadInfoImports();
}

async function ajouterDonnees(jsonData, entetesAssociatifs, enteteModule, entetesObligatoires, hmCompetences, hmCoefficient) {

	const idAnnee = $(".form-control").val();

	const isChecked = document.getElementById('alternant').checked;
	const alternant = isChecked ? 1 : 0;

	var selectElement = document.getElementById("semester");
	var selectedOption = selectElement.options[selectElement.selectedIndex];
	var lblSem = selectedOption.text;

	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, lblSem);

	etuSemestre = []
	

    for (const element of jsonData) {
        const codeEtu = Number(element.etudid);
        // Attendre l'ajout de l'étudiant et récupérer l'id de l'étudiant
        await ajouterEtudiant({ id_etu: codeEtu,
            code_etu: codeEtu, nom_etu: element.Nom, prenom_etu: element.Prénom, groupe_TD: element.TD, groupe_TP: element.TP, cursus: element.Cursus, alternant: alternant
        });


        try {

			var idEtu = codeEtu;
			etuSemestre.push({id_etu:idEtu, id_semestre:idSemestre, absences: element.Abs, rang:element.Rg, moyenne: element.Moy, validation:""});

			const etuComp = [];
			const etuModule = [];
            for (const competenceLabel in entetesAssociatifs) {
                if (entetesAssociatifs.hasOwnProperty(competenceLabel)) {
                    entetesAssociatifs[competenceLabel].forEach(moduleLabel => {
                        if (moduleLabel.startsWith("Bonus")) {
                            const idComp = hmCompetences[competenceLabel];
                            const bonus = element[moduleLabel] != null ? element[moduleLabel] : 0;
                            etuComp.push({ id_etu: idEtu, id_comp: idComp, moyenne_comp: element[competenceLabel], passage: "", bonus: bonus });
                        } else {
                            const idCoeff = hmCoefficient[moduleLabel + "-" + competenceLabel];
							var note =  Number(element[moduleLabel])
							if (element[moduleLabel] == "0") {
								note = 0;
							}
							else if (!note) {
								note = -1;
							}
                            etuModule.push({ id_etu: idEtu, id_coef: idCoeff, note: note });
                        }
                    });
                }
            }

            ajouterManyEtuComp(etuComp);
			ajouterManyEtuModule(etuModule);   

        } catch (error) {
            console.error("Une erreur s'est produite :", error);
        }
    }
	
	ajouterManyEtuSemestre(etuSemestre);

}
async function ajouterCompetencesEtModules(jsonData, entetesAssociatifs, enteteModule, enTetesAttendus, fichier) {

	const idAnnee = $(".form-control").val();

	var selectElement = document.getElementById("semester");
	var selectedOption = selectElement.options[selectElement.selectedIndex];
	var lblSem = selectedOption.text;

	var idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, lblSem);

	await ajouterSemestre(idSemestre, idAnnee, lblSem)

	idSemestre = await getIdSemestreByIdAnneeAndLabel(idAnnee, lblSem);

	const hmCompetences = {};
	const hmModules = {};
	const hmCoefficient = {};

	try {
		// Ajouter chaque compétence dans la base de données
		for (const competence in entetesAssociatifs) {
			var idComp = await getIdCompByLabel(competence);
			await ajouterCompetence(idComp, competence, idSemestre);
			idComp = await getIdCompByLabel(competence);
			hmCompetences[competence] = idComp;
		}

		// Ajouter chaque module dans la base de données
		for (const module of enteteModule) {
			if (!module.startsWith('Bonus')) {
				// const idMod = idModule + cptModule
				var idMod = await getIdModuleByLabel(module);
				await ajouterModule(idMod, module);
				idMod = await getIdModuleByLabel(module);
				hmModules[module] = idMod;
			}
		}

		// Récupérer l'ID du dernier module
		const idCoeff = await getMaxCoeffId();
		const coeff = []
		// Ajouter les coefficients dans la base de données
		var cptCoeff = 1;
		for (const competence in entetesAssociatifs) {
			if (entetesAssociatifs.hasOwnProperty(competence)) {
				for (const module of entetesAssociatifs[competence]) {
					if (!module.startsWith('Bonus')) {
						const idCo = idCoeff + cptCoeff;
						const verifCoeff = await verifCoeffExist(hmModules[module], hmCompetences[competence])
						if (!verifCoeff) {
							coeff.push({ id_module: hmModules[module], id_comp: hmCompetences[competence], coef: 0 })
							hmCoefficient[module + "-" + competence] = idCo;
							cptCoeff++;
						}
						
					}
				}
			}
		}

		ajouterManyCoeff(coeff);
		this.loadingFile.classList.add('d-none');
		this.btnAddFile.disabled = false;
	} catch (error) {
		console.error("Une erreur s'est produite :", error);
	}

	ajouterLogoFichier(fichier.name)
	ajouterDonnees(jsonData, entetesAssociatifs, enteteModule, enTetesAttendus, hmCompetences, hmCoefficient);
}

async function ajouterSemestre(idSemestre, idAnnee, lblSem) {
	if (idSemestre != -1) {
		
		return;
	}
	$.ajax({
		url: 'http://localhost:8000/api/addSemestre',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{id_annee:idAnnee, label:lblSem}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateEtudiant(idEtu, data) {
	console.log(updateEtudiant);
	$.ajax({
		url: 'http://localhost:8000/api/updateEtudiant',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_etu:idEtu, nom_etu:data.nom_etu, prenom_etu:data.prenom_etu, groupe_TD:data.groupe_TD, groupe_TP:data.groupe_TP, cursus:data.cursus, alternant:data.alternant}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterEtudiant(data) {
	console.log(JSON.stringify([data]));
	const exists = await verifEtudiantExists(data.id_etu)
	if (exists) {
		
		updateEtudiant(data.id_etu, data);
		return;
	}
	$.ajax({
		url: 'http://localhost:8000/api/addEtudiant',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([data]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterEtuModule(idEtu, idCoefficient, note) {
	$.ajax({
		url: 'http://localhost:8000/api/addEtuModule',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ id_etu: idEtu, id_coef: idCoefficient, note: note }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterManyEtuModule($manyData) {
	console.log($manyData)
	$.ajax({
		url: 'http://localhost:8000/api/addManyEtuModule',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify($manyData),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterManyEtuSemestre($manyData) {
	console.log($manyData);
	$.ajax({
		url: 'http://localhost:8000/api/addManyEtuSemestre',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify($manyData),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterEtuComp(idEtu, idComp, moyenneComp, passage, bonus = 0) {
	$.ajax({
		url: 'http://localhost:8000/api/addEtuComp',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ id_etu: idEtu, id_comp: idComp, moyenne_comp: moyenneComp, passage: passage, bonus: bonus }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateValidationEtuSemestre(idEtu, idSem, validation = "") {
	$.ajax({
		url: 'http://localhost:8000/api/updateValidationEtuSemestre',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{ id_etu: idEtu, id_semestre: idSem, validation: validation}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updatePassageEtuComp(idEtu, idComp, passage = "") {
	$.ajax({
		url: 'http://localhost:8000/api/updatePassageEtuComp',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{ id_etu: idEtu, id_comp: idComp, passage: passage}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterManyEtuComp($manyData) {
	console.log(JSON.stringify($manyData))
	$.ajax({
		url: 'http://localhost:8000/api/addManyEtuComp',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify($manyData),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function getIdModuleByLabel(label) {
	try {
		const response = await fetch(`http://localhost:8000/api/module`);
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const module = data.find(item => item.label == label);
			if (module) {
				return module.id_module;
			}
		}
		return -1;
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2;
	}
}

async function verifCoeffExist(idModule, idComp) {
	try {
		const response = await fetch(`http://localhost:8000/api/coefficient`);
		const data = await response.json();
		const coeff = data.find(item => item.id_comp == idComp && item.id_module == idModule);
		if (data && Array.isArray(data) && coeff) {
			return true;
		}
		return false;
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return false;
	}
}

async function getIdCompByLabel(label) {
	try {
		const response = await fetch(`http://localhost:8000/api/competence`);
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const competence = data.find(item => item.label == label);
			if (competence) {
				return competence.id_comp;
			}
		}
		return -1;
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2;
	}
}

async function ajouterModule(idMod, moduleLabel) {
	if (idMod !== -1) {
		
		return;
	}

	// Ajouter le module s'il n'existe pas
	$.ajax({
		url: 'http://localhost:8000/api/addModule',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ label: moduleLabel }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterCompetence(idCompetence, competenceLabel, idSemestre) {
	// Vérifier si la compétence existe déjà
	if (idCompetence !== -1) {
		
		return;
	}
	// Ajouter la compétence s'elle n'existe pas
	$.ajax({
		url: 'http://localhost:8000/api/addCompetence',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ label: competenceLabel, id_semestre: idSemestre }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});

}

async function ajouterCoefficient(idModule, idCompetence) {
	$.ajax({
		url: 'http://localhost:8000/api/addCoefficient',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ id_module: idModule, id_comp: idCompetence, coef: 1 }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function ajouterManyCoeff(dataJson) {
	$.ajax({
		url: 'http://localhost:8000/api/addManyCoefficient',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify(dataJson),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}


async function getMaxModuleId() {
	const responseModule = await fetch('http://localhost:8000/api/module');
	const modules = await responseModule.json();

	if (modules.length === 0) {
		return 0;
	}

	const maxId = modules.reduce((max, module) => {
		return Math.max(max, module.id_module);
	}, modules[0].id_module);

	return maxId;
}

async function getMaxCompetenceId() {
	const responseCompetence = await fetch('http://localhost:8000/api/competence');
	const competences = await responseCompetence.json();

	if (competences.length === 0) {
		return 0;
	}

	const maxId = competences.reduce((max, competence) => {
		return Math.max(max, competence.id_comp);
	}, competences[0].id_comp);

	return maxId;
}

async function getMaxCoeffId() {
	const responseCoefficient = await fetch('http://localhost:8000/api/coefficient');
	const coefficients = await responseCoefficient.json();

	if (coefficients.length === 0) {
		return 0;
	}

	const maxId = coefficients.reduce((max, coefficient) => {
		return Math.max(max, coefficient.id_coef);
	}, coefficients[0].id_coef);

	return maxId;
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

async function getLstSemestreByIdAnnee(idAnnee) {
	try {
		const response = await fetch(`http://localhost:8000/api/semestre`);
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const semestres = data
				.filter(item => item.id_annee == idAnnee)
				.sort((a, b) => a.label.localeCompare(b.label)); // Tri par ordre alphabétique du label

			return semestres;
		}
		return []; // Retourner un tableau vide si le semestre n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner un tableau vide en cas d'erreur
	}
}


async function getCompetencesByIdSemestre(idSemestre) {
	try {
		const response = await fetch(`http://localhost:8000/api/competence`);	
		const data = await response.json();

		if (data && Array.isArray(data)) {
			// Filtrer les compétences par id_semestre
			const competences = data.filter(item => item.id_semestre == idSemestre);
			
			// Trier les compétences par id_competence de manière croissante
			competences.sort((a, b) => a.id_competence - b.id_competence);
			
			return competences; // Retourner la liste triée des compétences pour le semestre
		}
		return []; // Retourner une liste vide si aucune compétence n'est trouvée
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return []; // Retourner une liste vide en cas d'erreur
	}
}

async function verifEtudiantExists(codeEtudiant) {

	try {
		const response = await fetch(`http://localhost:8000/api/etudiantCode/${codeEtudiant}`);
		const data = await response.json();
		if (data && Object.keys(data).length !== 0) {
			return true; // Retourner l'ID de l'étudiant s'il existe
		}
		return false; // Retourner null si l'étudiant n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return false; // Retourner null en cas d'erreur
	}
}

async function verifModuleExits(label) {
	try {
		const response = await fetch(`http://localhost:8000/api/module`);
		const data = await response.json();
		const module = data.filter(item => item.label == label);

		if (data && Array.isArray(data) && module) {
			return true
		}
		return false; // Retourner null si l'étudiant n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return false; // Retourner null en cas d'erreur
	}
}



async function updateFichier(idFichier, nom) {
	$.ajax({
		url: 'http://localhost:8000/api/updateFichier',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_fichier: idFichier, nom_fichier: nom}]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
	loadInfoImports();
}

async function ajouterFichier(nom, type, idSem, idAnnee) {
	
	$.ajax({
		url: 'http://localhost:8000/api/addFichier',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ nom_fichier: nom, type: type, id_semestre: idSem, id_annee: Number(idAnnee) }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function updateCoeff(idCoeff, coeff) {
	$.ajax({
		url: 'http://localhost:8000/api/updateCoefficient',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{ id_coef: idCoeff, coef: coeff }]),
		success: function(data) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
}

async function loadInfoImports() {
	const idAnnee = $(".form-control").val();
	var lstFiles = await getAllFile(idAnnee);
	if (lstFiles) {
		for (file of lstFiles) {
			const labelSemestre = "" + await getLabelSemestreById(file.id_semestre);
			const match = labelSemestre.match(/\d+/);
			const numSemestre = match ? parseInt(match[0]) : null;
			const img = document.getElementById(file.type+""+numSemestre);
			if (img) {
				img.classList.add("visibleImg");
				img.classList.remove("invisibleImg")
				img.title = file.nom_fichier;
			}
			
		}
	}
	this.loadingCoeff.classList.add('d-none');
	this.btnAddCoeff.disabled = false;
}

async function getAllFile(idAnnee) {
	try {
		const response = await fetch(`http://localhost:8000/api/fichier`);
		const data = await response.json();
		if (data && Object.keys(data).length !== 0) {
			return data
		}
		return; 
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return; 
	}
}

async function getLabelSemestreById(idSemestre) {
	try {
		const response = await fetch(`http://localhost:8000/api/semestre/${idSemestre}`);
		const data = await response.json();
		if (data && Object.keys(data).length !== 0) {
			return data[0].label;
		}
		return -1;
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2;
	}
}


async function getFichierByAnneeAndSemestreAndType(idAnnee, idSem, type) {
	try {
		const response = await fetch(`http://localhost:8000/api/fichier`);
		const data = await response.json();

		if (data && Array.isArray(data)) {
			const fichier = data.find(item => item.id_annee == idAnnee && item.id_semestre == idSem && item.type == type);
			if (fichier) {
				return fichier.id_fichier;
			}
		}
		return;
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return; 
	}
}

async function getIdCoeffByModAndComp(idComp, idMod) {
	try {
		const response = await fetch(`http://localhost:8000/api/coefficient`);
		const data = await response.json();
		if (data && Array.isArray(data)) {
			const coefficient = data.find(item => item.id_module == idMod && item.id_comp == idComp);
			if (coefficient) {
				return coefficient.id_coef; // Retourner l'ID du semestre s'il existe
			}
		}
		return -1; // Retourner -1 si le semestre n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2; // Retourner -2 en cas d'erreur
	}
}


