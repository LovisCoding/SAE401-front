class Import {

	// Déclaration du constructeur

	constructor() {
		this.btnAddFile = document.getElementById('addFile');
		this.setupListeners();
		this.loadInfoImport();
	}

	loadInfoImport() {
		loadInfoImports();
	}

	setupListeners() {
		this.btnAddFile.addEventListener('click', (event) => {
			this.importerFichier();
		});

	}

	importerFichier() {
		const input = document.getElementById('file');
		const fichier = input.files[0];

		if (!fichier) {
			alert("Veuillez sélectionner un fichier Excel.");
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
						entetesAssociatifs[enteteBIN] = [];
					} else if (enteteBIN && (cleanEnTete.startsWith('BINR') || cleanEnTete.startsWith('BINS') || cleanEnTete.startsWith('BINP') || cleanEnTete.startsWith('Bonus') )) {
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

}

const importInstance = new Import();

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

	const idFichier = await getFichierByAnneeAndSemestreAndType(idAnnee, idSemestre, type);
	if (idFichier) {
		updateFichier(idFichier, fileInput)
	}
	else {
		ajouterFichier(fileInput, type, idSemestre, idAnnee)
	}

	loadInfoImport();
}

async function ajouterDonnees(jsonData, entetesAssociatifs, enteteModule, entetesObligatoires, hmCompetences, hmCoefficient) {

	const isChecked = document.getElementById('alternant').checked;
	const alternant = isChecked ? 1 : 0;

    for (const element of jsonData) {
        const codeEtu = Number(element.etudid);
		var idEtu = await getIdEtudiantByCode(codeEtu);
        // Attendre l'ajout de l'étudiant et récupérer l'id de l'étudiant
        await ajouterEtudiant(idEtu, {
            code_etu: codeEtu, nom_etu: element.Nom, prenom_etu: element.Prénom, groupe_TD: element.TD, groupe_TP: element.TP, cursus: element.Cursus, alternant: alternant
        });

        try {
            idEtu = await getIdEtudiantByCode(codeEtu);

            // Créer les listes de données pour les ajouts en masse
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
                            etuModule.push({ id_etu: idEtu, id_coef: idCoeff, note: element[moduleLabel] });
                        }
                    });
                }
            }

            // Ajouter les données en masse
            await ajouterManyEtuComp(etuComp);
            await ajouterManyEtuModule(etuModule);

        } catch (error) {
            console.error("Une erreur s'est produite :", error);
        }
    }

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
		// Récupérer l'ID de la dernière compétence
		const idCompetence = await getMaxCompetenceId();

		// Ajouter chaque compétence dans la base de données
		var cptComp = 1;
		for (const competence in entetesAssociatifs) {
			const idComp = idCompetence + cptComp;
			await ajouterCompetence(idComp, competence, idSemestre);
			hmCompetences[competence] = idComp;
			cptComp ++;
		}

		// Récupérer l'ID du dernier module
		const idModule = await getMaxModuleId();

		// Ajouter chaque module dans la base de données
		var cptModule = 1;
		for (const module of enteteModule) {
			if (!module.startsWith('Bonus')) {
				const idMod = idModule + cptModule;
				await ajouterModule(idMod, module);
				hmModules[module] = idMod;
				cptModule++;
			}
		}

		// Récupérer l'ID du dernier module
		const idCoeff = await getMaxCoeffId();

		// Ajouter les coefficients dans la base de données
		var cptCoeff = 1;
		for (const competence in entetesAssociatifs) {
			if (entetesAssociatifs.hasOwnProperty(competence)) {
				for (const module of entetesAssociatifs[competence]) {
					if (!module.startsWith('Bonus')) {
						const idCo = idCoeff + cptCoeff;
						await ajouterCoefficient(idCo, hmModules[module], hmCompetences[competence]);
						hmCoefficient[module + "-" + competence] = idCo;
						cptCoeff++;
					}
				}
			}
		}

	} catch (error) {
		console.error("Une erreur s'est produite :", error);
	}

	ajouterLogoFichier(fichier.name)
	ajouterDonnees(jsonData, entetesAssociatifs, enteteModule, enTetesAttendus, hmCompetences, hmCoefficient);
}

async function ajouterSemestre(idSemestre, idAnnee, lblSem) {
	if (idSemestre != -1) {
		console.log("existe déjà");
		return;
	}
	$.ajax({
		url: 'http://localhost:8000/api/addSemestre',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{id_annee:idAnnee, label:lblSem}]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}


async function ajouterEtudiant(idEtu, data) {
	if (idEtu != -1) {
		console.log("existe déjà");
		return;
	}
	$.ajax({
		url: 'http://localhost:8000/api/addEtudiant',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([data]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
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
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}

async function ajouterManyEtuModule($manyData) {
	$.ajax({
		url: 'http://localhost:8000/api/addManyEtuModule',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify($manyData),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
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
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}

async function ajouterManyEtuComp($manyData) {
	$.ajax({
		url: 'http://localhost:8000/api/addManyEtuComp',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify($manyData),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}

async function ajouterModule(idModule, moduleLabel) {
	// Vérifier si le module existe déjà
	const response = await fetch(`http://localhost:8000/api/module/${idModule}`);
	const data = await response.json();
	if (data && Object.keys(data).length !== 0) {
		console.log(`Le module avec l'ID ${idModule} existe déjà.`);
		return;
	}

	// Ajouter le module s'il n'existe pas
	$.ajax({
		url: 'http://localhost:8000/api/addModule',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ label: moduleLabel }]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}

async function ajouterCompetence(idCompetence, competenceLabel, idSemestre) {
	// Vérifier si la compétence existe déjà
	const response = await fetch(`http://localhost:8000/api/competence/${idCompetence}`);
	const data = await response.json();
	if (data && Object.keys(data).length !== 0) {
		console.log(`La compétence avec l'ID ${idCompetence} existe déjà.`);
		return; // Sortir de la fonction si la compétence existe déjà
	}

	// Ajouter la compétence s'elle n'existe pas
	$.ajax({
		url: 'http://localhost:8000/api/addCompetence',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ label: competenceLabel, id_semestre: idSemestre }]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});

}

async function ajouterCoefficient(idCoeff, idModule, idCompetence) {
	const response = await fetch(`http://localhost:8000/api/coefficient/${idCoeff}`);
	const data = await response.json();
	if (data && Object.keys(data).length !== 0) {
		console.log(`Le coefficient avec l'ID ${idCoeff} existe déjà.`);
		return;
	}

	$.ajax({
		url: 'http://localhost:8000/api/addCoefficient',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ id_module: idModule, id_comp: idCompetence, coef: 1 }]),
		success: function(data) {
			console.log('Success Coefficient : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
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
			console.log(semestre);
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


async function getIdEtudiantByCode(codeEtudiant) {
	try {
		const response = await fetch(`http://localhost:8000/api/etudiantCode/${codeEtudiant}`);
		const data = await response.json();
		if (data && Object.keys(data).length !== 0) {
			return data[0].id_etu; // Retourner l'ID de l'étudiant s'il existe
		}
		return -1; // Retourner null si l'étudiant n'existe pas
	} catch (error) {
		console.error('Une erreur s\'est produite :', error);
		return -2; // Retourner null en cas d'erreur
	}
}

async function updateFichier(idFichier, nom) {
	$.ajax({
		url: 'http://localhost:8000/api/updateFichier',
		type: 'PUT',
		dataType: 'json',
		data: JSON.stringify([{id_fichier: idFichier, nom_fichier: nom}]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
		}
	});
}

async function ajouterFichier(nom, type, idSem, idAnnee) {
	$.ajax({
		url: 'http://localhost:8000/api/addFichier',
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify([{ nom_fichier: nom, type: type, id_semestre: idSem, id_annee: idAnnee }]),
		success: function(data) {
			console.log('Success : ');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('Erreur : ' + errorThrown);
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
				img.classList = ["visibleImg"];
				img.title = file.nom_fichier;
			}
			
		}
	}
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


