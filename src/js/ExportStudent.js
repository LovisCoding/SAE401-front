async function loadImage(file) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = () => resolve(fileReader.result);
		fileReader.onerror = () => reject(fileReader.error);
		fileReader.readAsArrayBuffer(file);
	});
}

async function createPdf(type) {

	const zip = new JSZip();

	const studentSelect = document.querySelector('.student');
	let student = [];

	if (type === 'unique') {
		student.push(studentSelect.options[studentSelect.selectedIndex].text);
	} else if (type === 'multiple' || type === 'uniquePromo') {
		student = Array.from(studentSelect.options).map(option => option.text);
	}

	const year = $(".form-control-modified option:selected").text();
	const yearBefore = (parseInt(year.split('-')[0]) - 1) + '-' + (parseInt(year.split('-')[1]) - 1);
	const yearBefore2 = (parseInt(year.split('-')[0]) - 2) + '-' + (parseInt(year.split('-')[1]) - 2);

	const semester2 = await getSemestre('Semestre 2', getAnnee(yearBefore2));
	const semester4 = await getSemestre('Semestre 4', getAnnee(yearBefore));
	const semester5 = await getSemestre('Semestre 5', getAnnee(year));

	const lstImportBUT1 = await getLstImport(semester2.id_semestre, 2, semester2.id_annee);
	const lstImportBUT2 = await getLstImport(semester4.id_semestre, 4, semester4.id_annee);
	const lstImportBUT3 = await getLstImport(semester5.id_semestre, 5, semester5.id_annee);

	const existingPdfBytes = await fetch('./Avis_Poursuite_etudes_modele.pdf').then(res => res.arrayBuffer());
	const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

	for (const stud of student) {

		if (type === 'multiple') {
			const existingPdfBytes = await fetch('./Avis_Poursuite_etudes_modele.pdf').then(res => res.arrayBuffer());
			pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
		}

		let page = pdfDoc.getPages()[0];

		if (type === 'uniquePromo' && student.indexOf(stud) !== 0) {
			page = pdfDoc.addPage();
			const backgroundBytes = await fetch('./Avis_Poursuite_etudes_modele.jpg').then(res => res.arrayBuffer());
			const backgroundImage = await pdfDoc.embedJpg(backgroundBytes);
			const { width, height } = page.getSize();
			page.drawImage(backgroundImage, {
				x: 0,
				y: 0,
				width: width,
				height: height,
				opacity: 1,
			});
		}
	
		const { width, height } = page.getSize();
		const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
		const color = PDFLib.rgb(0, 0, 0);

		const fileInputLogo = document.getElementById('fileLogo');
		const fileLogo = fileInputLogo.files[0];

		if (fileLogo) {
			try {
				const imageBytes3 = await loadImage(fileLogo);
				const image = await pdfDoc.embedPng(imageBytes3);
				const imageDims = image.scale(0.5);
				page.drawImage(image, {
					x: page.getWidth() / 2 - imageDims.width / 2 - 220,
					y: page.getHeight() / 2 - imageDims.height / 2 + 370,
					width: imageDims.width,
					height: imageDims.height,
				});
			} catch (error) {
				console.error('Error loading the image: ', error);
			}
		} else {
			console.error('No file selected');
		}

		const fileInputLogo2 = document.getElementById('fileLogo2');
		const fileLogo2 = fileInputLogo2.files[0];

		if (fileLogo2) {
			try {
				const imageBytes4 = await loadImage(fileLogo2);
				const image2 = await pdfDoc.embedPng(imageBytes4);
				const imageDims2 = image2.scale(0.5);
				page.drawImage(image2, {
					x: page.getWidth() / 2 - imageDims2.width / 2 + 210,
					y: page.getHeight() / 2 - imageDims2.height / 2 + 370,
					width: imageDims2.width,
					height: imageDims2.height,
				});
			} catch (error) {
				console.error('Error loading the image: ', error);
			}
		} else {
			console.error('No file selected');
		}

		const fileInput = document.getElementById('fileSign');
		const file = fileInput.files[0];

		if (file) {
			try {
				const imageBytes3 = await loadImage(file);
				const image = await pdfDoc.embedPng(imageBytes3);
				const imageDims = image.scale(0.1);
				page.drawImage(image, {
					x: page.getWidth() / 2 - imageDims.width / 2 + 190,
					y: page.getHeight() / 2 - imageDims.height / 2 - 380,
					width: imageDims.width,
					height: imageDims.height,
				});
			} catch (error) {
				console.error('Error loading the image: ', error);
			}
		} else {
			console.error('No file selected');
		}

		page.drawText(stud, { x: 210, y: height - 4 * 35.5, size: 10, font: font, color: color, });

		let niveau_Y = height - 4 * 38.7;

		const studentData = await fetch(`http://localhost:8000/api/etudiant`).then(res => res.json());
		const studentName = stud.split(' ')[0];
		const studentPrenom = stud.split(' ')[1];
		const studentInfo = studentData.find(s => s.nom_etu === studentName && s.prenom_etu === studentPrenom);
		const isAlternant = studentInfo.alternant;

		page.drawText('Non', { x: 251, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText('Non', { x: 371, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(isAlternant ? 'Oui' : 'Non', { x: 485, y: niveau_Y, size: 10, font: font, color: color });

		niveau_Y = height - 4 * 41.7;
		const yearPromo = (parseInt(year.split('-')[0]) - 2) + '-' + (parseInt(year.split('-')[1]));
		page.drawText(yearBefore2, { x: 251, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(yearBefore, { x: 371, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(year, { x: 485, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(yearPromo, { x: 410, y: height - 4 * 21, size: 10, font: font, color: color, });

		let niveau_X = 229;
		niveau_Y = 500;

		const students = await getStudents();
		const studentsInfo = students.find(s => s.nom_etu === studentName && s.prenom_etu === studentPrenom);

		const moyenneBUT1 = await getMoyenneEtu(lstImportBUT1, studentsInfo.id_etu);
		const moyenneBUT2 = await getMoyenneEtu(lstImportBUT2, studentsInfo.id_etu);
		const moyenneBUT3 = await getMoyenneEtu(lstImportBUT3, studentsInfo.id_etu);

		const rangEtuBUT1 = await getRangEtu(lstImportBUT1, studentsInfo.id_etu);
		const rangEtuBUT2 = await getRangEtu(lstImportBUT2, studentsInfo.id_etu);
		const rangEtuBUT3 = await getRangEtu(lstImportBUT3, studentsInfo.id_etu);

		for (let index = moyenneBUT1.length - 1; index >= 0; index--) {
			let moyenne = moyenneBUT1[index];
			let rang = rangEtuBUT1[index];
			page.drawText(moyenne + '', { x: niveau_X, y: niveau_Y, size: 10, font: font, color: color });
			page.drawText(rang + '', { x: niveau_X + 45, y: niveau_Y, size: 10, font: font, color: color });
			niveau_Y += 15;
		}

		niveau_X = 229 + 75;
		niveau_Y = 500;

		for (let index = moyenneBUT2.length - 1; index >= 0; index--) {
			let moyenne = moyenneBUT2[index];
			let rang = rangEtuBUT2[index];
			page.drawText(moyenne + '', { x: niveau_X, y: niveau_Y, size: 10, font: font, color: color });
			page.drawText(rang + '', { x: niveau_X + 45, y: niveau_Y, size: 10, font: font, color: color });
			niveau_Y += 15;
		}

		niveau_X = 229 + 42;
		niveau_Y = 392;

		for (let index = moyenneBUT3.length - 1; index >= 0; index--) {
			if (index === 0) {
				niveau_Y = 378 - 45;
			}
			let moyenne = moyenneBUT3[index];
			let rang = rangEtuBUT3[index];
			page.drawText(moyenne + '', { x: niveau_X, y: niveau_Y, size: 10, font: font, color: color });
			page.drawText(rang + '', { x: niveau_X + 65, y: niveau_Y, size: 10, font: font, color: color });
			niveau_Y += 15;
		}

		const moduleLabels = ['BINR106', 'BINR107', 'BINR207', 'BINR208', 'BINR209', 'BINR308', 'BINR309', 'BINR412', 'BINR511', 'BINR512', 'BINR110', 'BINR212', 'BINR312', 'BINR405'];

		const modules = await getModules();
		const coefficients = await getCoefficents();
		const etumodules = await getEtumodules();
		const allStudent = await getStudents();

		const moduleData = {};
		const coeffData = {};
		const etumoduleData = {};

		moduleLabels.forEach(label => {
			const module = modules.find(m => m.label === label);
			const coeff = coefficients.find(c => c.id_module === module.id_module);
			
			moduleData[label] = module;
			coeffData[label] = coeff;
		});

		const studentAverages = {};

		allStudent.forEach(student => {
			const studentId = student.id_etu;
			const studentModules = etumodules.filter(e => e.id_etu === studentId);

			moduleLabels.forEach(label => {
				const coeff = coeffData[label];
				const etumodule = studentModules.find(e => e.id_coef === coeff.id_coef) || { note: 0 };
				etumoduleData[label] = etumodule;
			});

			const moyenneMaths = moduleLabels.slice(0, 5).reduce((acc, label) => acc + (parseFloat(etumoduleData[label].note) || 0), 0) / 5;
			const moyenneBUT2Maths = moduleLabels.slice(5, 8).reduce((acc, label) => acc + (parseFloat(etumoduleData[label].note) || 0), 0) / 3;
			const moyenneBUT3Maths = moduleLabels.slice(8, 10).reduce((acc, label) => acc + (parseFloat(etumoduleData[label].note) || 0), 0) / 2;
			const moyenneAnglais = moduleLabels.slice(10, 12).reduce((acc, label) => acc + (parseFloat(etumoduleData[label].note) || 0), 0) / 2;
			const moyenneAnglaisBUT2 = moduleLabels.slice(12).reduce((acc, label) => acc + (parseFloat(etumoduleData[label].note) || 0), 0) / 2;

			studentAverages[studentId] = {
				moyenneMaths,
				moyenneBUT2Maths,
				moyenneBUT3Maths,
				moyenneAnglais,
				moyenneAnglaisBUT2
			};
		});

		const rankStudents = (subject) => {
			const averages = Object.values(studentAverages).map(avg => avg[subject]);
			const sortedAverages = [...averages].sort((a, b) => b - a);

			return allStudent.map(student => {
				const studentId = student.id_etu;
				const studentAverage = studentAverages[studentId][subject];
				const rank = sortedAverages.indexOf(studentAverage) + 1;
				
				return {
					studentId,
					rank,
					average: studentAverage
				};
			});
		};

		const specificStudentId = studentsInfo.id_etu;

		const ranksMaths = rankStudents('moyenneMaths');
		const ranksBUT2Maths = rankStudents('moyenneBUT2Maths');
		const ranksBUT3Maths = rankStudents('moyenneBUT3Maths');
		const ranksAnglais = rankStudents('moyenneAnglais');
		const ranksAnglaisBUT2 = rankStudents('moyenneAnglaisBUT2');

		const findStudentRank = (ranks, studentId) => {
			const studentRank = ranks.find(rank => rank.studentId === studentId);
			return studentRank ? studentRank.rank : null;
		};

		const specificStudentRanks = {
			moyenneMaths: findStudentRank(ranksMaths, studentsInfo.id_etu),
			moyenneBUT2Maths: findStudentRank(ranksBUT2Maths, studentsInfo.id_etu),
			moyenneBUT3Maths: findStudentRank(ranksBUT3Maths, studentsInfo.id_etu),
			moyenneAnglais: findStudentRank(ranksAnglais, studentsInfo.id_etu),
			moyenneAnglaisBUT2: findStudentRank(ranksAnglaisBUT2, studentsInfo.id_etu)
		};

		const specificStudentAverages = studentAverages[studentsInfo.id_etu];

		if (specificStudentAverages) {

			const {
				moyenneMaths,
				moyenneBUT2Maths,
				moyenneBUT3Maths,
				moyenneAnglais,
				moyenneAnglaisBUT2
			} = specificStudentAverages;

			const {
				moyenneMaths: rankMaths,
				moyenneBUT2Maths: rankBUT2Maths,
				moyenneBUT3Maths: rankBUT3Maths,
				moyenneAnglais: rankAnglais,
				moyenneAnglaisBUT2: rankAnglaisBUT2
			} = specificStudentRanks;
		
			niveau_X = 259;
			page.drawText(moyenneMaths.toFixed(2) + '', { x: niveau_X - 30, y: height - 4 * 89, size: 10, font: font, color: color });
			niveau_X += 45;
			page.drawText(rankMaths + '', { x: niveau_X - 30, y: height - 4 * 89, size: 10, font: font, color: color });
			niveau_X = 330;
			page.drawText(moyenneBUT2Maths.toFixed(2) + '', { x: niveau_X - 25, y: height - 4 * 89, size: 10, font: font, color: color });
			niveau_X += 49;
			page.drawText(rankBUT2Maths + '', { x: niveau_X - 30, y: height - 4 * 89, size: 10, font: font, color: color });

			niveau_X = 309;

			if (moyenneBUT3Maths === 0) {
				page.drawText('', { x: niveau_X - 32, y: height - 4 * 130.5, size: 10, font: font, color: color });
			} else {
				page.drawText(moyenneBUT3Maths.toFixed(2) + '', { x: niveau_X - 38, y: height - 4 * 130.5, size: 10, font: font, color: color });
			}

			niveau_X += 57;

			if (moyenneBUT3Maths === 0) {
				page.drawText('', { x: niveau_X - 32, y: height - 4 * 130.5, size: 10, font: font, color: color });
			} else {
				page.drawText(rankBUT3Maths + '', { x: niveau_X - 30, y: height - 4 * 130.5, size: 10, font: font, color: color });
			}
		
			niveau_X = 259;
			page.drawText(moyenneAnglais.toFixed(2) + '', { x: niveau_X - 30, y: height - 4 * 92.5, size: 10, font: font, color: color });
			niveau_X += 45;
			page.drawText(rankAnglais + '', { x: niveau_X - 30, y: height - 4 * 92.5, size: 10, font: font, color: color });
			niveau_X = 330;
			page.drawText(moyenneAnglaisBUT2.toFixed(2) + '', { x: niveau_X - 25, y: height - 4 * 92.5, size: 10, font: font, color: color });
			niveau_X += 49;
			page.drawText(rankAnglaisBUT2 + '', { x: niveau_X - 30, y: height - 4 * 92.5, size: 10, font: font, color: color });
		} else {
			console.error(`Averages for student ${specificStudentId} are not available.`);
		}

		const absences = await getAbsencesEtudiant(studentsInfo.id_etu);
		const semestreAbsences = Array.from({ length: 6 }, () => []);

		absences.forEach((absence) => {
			const semestreIndex = absence.id_semestre - 1;
			semestreAbsences[semestreIndex].push(absence.absences);
		});
		
		const absencesYear = Array.from({ length: 3 }, () => []);

		absencesYear[0] = semestreAbsences[0].map((absence, index) => absence + semestreAbsences[1][index]);
		absencesYear[1] = semestreAbsences[2].map((absence, index) => absence + semestreAbsences[3][index]);
		absencesYear[2] = semestreAbsences[4].map((absence, index) => absence + semestreAbsences[5][index]);

		niveau_X = 259;
		page.drawText(absencesYear[0] + '', { x: niveau_X, y: height - 4 * 96, size: 10, font: font, color: color });
		niveau_X = 330;
		page.drawText(absencesYear[1] + '', { x: niveau_X, y: height - 4 * 96, size: 10, font: font, color: color });
		niveau_X = 309;
		page.drawText(absencesYear[2] + '', { x: niveau_X, y: height - 4 * 134.5, size: 10, font: font, color: color });

		const avisMaster = document.getElementById('avisMaster').value;

		if (avisMaster === 'Très favorable') {
			page.drawText('X', { x: 231, y: height - 4 * 157.3, size: 10, font: font, color: color });
		} else if (avisMaster === 'Favorable') {
			page.drawText('X', { x: 231 + 71, y: height - 4 * 157.3, size: 10, font: font, color: color });
		} else if (avisMaster === 'Assez favorable') {
			page.drawText('X', { x: 231 + 69 * 2, y: height - 4 * 157.3, size: 10, font: font, color: color });
		} else if (avisMaster === 'Sans avis') {
			page.drawText('X', { x: 231 + 68.5 * 3, y: height - 4 * 157.3, size: 10, font: font, color: color });
		} else if (avisMaster === 'Réservé') {
			page.drawText('X', { x: 231 + 71 * 4, y: height - 4 * 157.3, size: 10, font: font, color: color });
		}

		const avisEcoleIngenieur = document.getElementById('avisEcoleIngenieur').value;

		if (avisEcoleIngenieur === 'Très favorable') {
			page.drawText('X', { x: 231, y: height - 4 * 162.6, size: 10, font: font, color: color });
		} else if (avisEcoleIngenieur === 'Favorable') {
			page.drawText('X', { x: 231 + 71, y: height - 4 * 162.6, size: 10, font: font, color: color });
		} else if (avisEcoleIngenieur === 'Assez favorable') {
			page.drawText('X', { x: 231 + 69 * 2, y: height - 4 * 162.6, size: 10, font: font, color: color });
		} else if (avisEcoleIngenieur === 'Sans avis') {
			page.drawText('X', { x: 231 + 68.5 * 3, y: height - 4 * 162.6, size: 10, font: font, color: color });
		} else if (avisEcoleIngenieur === 'Réservé') {
			page.drawText('X', { x: 231 + 71 * 4, y: height - 4 * 162.6, size: 10, font: font, color: color });
		}

		const avis = await fetchAndProcessAvis();

		page.drawText(avis.tresFavorableMaster + '', { x: 228, y: height - 4 * 168, size: 10, font: font, color: color });
		page.drawText(avis.favorableMaster + '', { x: 228 + 71, y: height - 4 * 168, size: 10, font: font, color: color });
		page.drawText(avis.assezFavorableMaster + '', { x: 228 + 69 * 2, y: height - 4 * 168, size: 10, font: font, color: color });
		page.drawText(avis.sansAvisMaster + '', { x: 228 + 68.5 * 3, y: height - 4 * 168, size: 10, font: font, color: color });
		page.drawText(avis.reserveMaster + '', { x: 228 + 71 * 4, y: height - 4 * 168, size: 10, font: font, color: color });

		page.drawText(avis.tresFavorableInge + '', { x: 228, y: height - 4 * 173, size: 10, font: font, color: color });
		page.drawText(avis.favorableInge + '', { x: 228 + 71, y: height - 4 * 173, size: 10, font: font, color: color });
		page.drawText(avis.assezFavorableInge + '', { x: 228 + 69 * 2, y: height - 4 * 173, size: 10, font: font, color: color });
		page.drawText(avis.sansAvisInge + '', { x: 228 + 68.5 * 3, y: height - 4 * 173, size: 10, font: font, color: color });
		page.drawText(avis.reserveInge + '', { x: 228 + 71 * 4, y: height - 4 * 173, size: 10, font: font, color: color });
		
		page.drawText(document.getElementById('commentaire').value, { x: 120, y: height - 4 * 179, size: 10, font: font, color: color, });

		page.drawText(document.getElementById('department').value, { x: 350, y: height - 4 * 193, size: 10, font: font, color: color, });

		if (type === 'unique') {
			const pdfBytes = await pdfDoc.save();
			const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
			const pdfUrl = URL.createObjectURL(pdfBlob);
			const downloadLink = document.createElement('a');
			downloadLink.href = pdfUrl;
			downloadLink.download = `Avis_Poursuite_Etudes_${studentInfo.id_etu}.pdf`;
			downloadLink.click();
		
		} else if (type === 'multiple') {
			const pdfBytes = await pdfDoc.save();
			zip.file(`${stud}.pdf`, pdfBytes);
		}
	}

	if (type === 'multiple') {
		const zipBlob = await zip.generateAsync({ type: 'blob' });

		const link = document.createElement('a');
		link.href = URL.createObjectURL(zipBlob);
		link.download = 'Avis_Poursuite_Etudes.zip';
		link.click();
	} else if (type === 'uniquePromo') {
		const pdfBytes = await pdfDoc.save();
		const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
		const pdfUrl = URL.createObjectURL(pdfBlob);
		const downloadLink = document.createElement('a');
		downloadLink.href = pdfUrl;
		downloadLink.download = `Avis_Poursuite_Etudes_${year}.pdf`;
		downloadLink.click();
	}
}

async function fetchAndProcessAvis() {
	const avisData = await fetch('http://localhost:8000/api/avis').then(res => res.json());
	const avisCounts = {
		tresFavorableMaster: 0,
		favorableMaster: 0,
		assezFavorableMaster: 0,
		sansAvisMaster: 0,
		reserveMaster: 0,
		tresFavorableInge: 0,
		favorableInge: 0,
		assezFavorableInge: 0,
		sansAvisInge: 0,
		reserveInge: 0
	};

	avisData.forEach(avis => {
		switch (avis.avis_master) {
			case 'Très favorable':
				avisCounts.tresFavorableMaster++;
				break;
			case 'Favorable':
				avisCounts.favorableMaster++;
				break;
			case 'Assez favorable':
				avisCounts.assezFavorableMaster++;
				break;
			case 'Sans avis':
				avisCounts.sansAvisMaster++;
				break;
			case 'Réservé':
				avisCounts.reserveMaster++;
				break;
		}

		switch (avis.avis_inge) {
			case 'Très favorable':
				avisCounts.tresFavorableInge++;
				break;
			case 'Favorable':
				avisCounts.favorableInge++;
				break;
			case 'Assez favorable':
				avisCounts.assezFavorableInge++;
				break;
			case 'Sans avis':
				avisCounts.sansAvisInge++;
				break;
			case 'Réservé':
				avisCounts.reserveInge++;
				break;
		}
	});

	return avisCounts;
}

document.getElementById('exportStudent').addEventListener('click', function() {
	if (document.getElementById('fileUnique').checked) {
		createPdf('unique');
	} else if (document.getElementById('fileMultiple').checked) {
		createPdf('multiple');
	} else if (document.getElementById('fileUniquePromo').checked) {
		createPdf('uniquePromo');
	}
});


async function getCompetences() {
	const response = await fetch('http://localhost:8000/api/competence');
	return response.json();
}

async function getStudents() {
	const response = await fetch('http://localhost:8000/api/etudiant');
	return response.json();
}

async function getAbsencesEtudiant(etudiantId) {
	const response = await fetch(`http://localhost:8000/api/etuSemestre/${etudiantId}`);
	return response.json();
}

async function getEtumodules() {
	const response = await fetch('http://localhost:8000/api/etuModule');
	return response.json();
}

async function getLstImport(idSemestre, numSemestre, idAnnee) {
	let lstCompetences = await getCompetencesByIdSemestre(idSemestre);

	let lstEtudiants = await getEtudiantsByIdSemestre(idSemestre);
	let lstEtuComp = await getEtuComp();	

	let lstSemestres = await getSemestres();
	let lstAllCompetences = await getCompetences();

	let lstImport = []
	for (let i = 0; i < lstEtudiants.length; i++) {
		let lstNoteEtudiant = []
		let etudiant = lstEtudiants[i];
		
		// Info de l'étudiant
		lstNoteEtudiant.push(etudiant.code_etu);

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

		lstImport.push(lstNoteEtudiant)
	}

	return lstImport;
}

async function getRangEtu(lstImport, idEtu) {
	let lstRangEtu = [];
	if (!lstImport || !lstImport[0]) {
		return;
	}
	let numComp = lstImport[0].length - 1;

	for (let i=1 ; i<=numComp ; i++) {
		lstImport.sort((a, b) => {
			return parseFloat(b[i]) - parseFloat(a[i]);
		});

		var rangEtu = -1
		for (let i = 0; i < lstImport.length; i++) {
			if (Number(lstImport[i][0]) == idEtu) {
				rangEtu = i+1;
			}
		}

		lstRangEtu.push(rangEtu);

	}

	return lstRangEtu;
}

async function getMoyenneEtu(lstImport, idEtu) {
	let lstMoyenneEtu = [];
	if (!lstImport || !lstImport[0]) {
		return;
	}

	// Trouver la sous-liste contenant l'ID
	let etudiant = lstImport.find(item => Number(item[0]) === idEtu);

	// Si l'étudiant est trouvé, extraire les éléments après le premier
	if (etudiant) {
		lstMoyenneEtu = etudiant.slice(1);
	}

	return lstMoyenneEtu;
}

async function getSemestre(label) {
	const response = await fetch(`http://localhost:8000/api/semestre`);
	const data = await response.json();
	return data.find(item => item.label == label);
}

async function getAnnee(annee) {
	const response = await fetch(`http://localhost:8000/api/annee`);
	const data = await response.json();
	return data.find(item => item.annee == annee);
}

async function getCoefficents() {
	const response = await fetch('http://localhost:8000/api/coefficient');
	return response.json();
}