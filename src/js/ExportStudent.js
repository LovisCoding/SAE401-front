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
	} else if (type === 'multiple') {
		student = Array.from(studentSelect.options).map(option => option.text);
	}

	for (const stud of student) {
		const existingPdfBytes = await fetch('./Avis_Poursuite_etudes_modele.pdf').then(res => res.arrayBuffer());
		const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
		
		const page = pdfDoc.getPages()[0];
	
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
		page.drawText(isAlternant ? 'Oui' : 'Non', { x: 371, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(isAlternant ? 'Oui' : 'Non', { x: 485, y: niveau_Y, size: 10, font: font, color: color });

		niveau_Y = height - 4 * 41.7;
		const year = $(".form-control-modified option:selected").text();
		const yearBefore = (parseInt(year.split('-')[0]) - 1) + '-' + (parseInt(year.split('-')[1]) - 1);
		const yearBefore2 = (parseInt(year.split('-')[0]) - 2) + '-' + (parseInt(year.split('-')[1]) - 2);
		const yearPromo = (parseInt(year.split('-')[0]) - 2) + '-' + (parseInt(year.split('-')[1]));
		page.drawText(yearBefore2, { x: 251, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(yearBefore, { x: 371, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(year, { x: 485, y: niveau_Y, size: 10, font: font, color: color });
		page.drawText(yearPromo, { x: 410, y: height - 4 * 21, size: 10, font: font, color: color, });

		let niveau_X = 229;
		niveau_Y = 66.6;

		const students = await getStudents();
		const studentsInfo = students.find(s => s.nom_etu === studentName && s.prenom_etu === studentPrenom);

		const competences = await getCompetences();
		const scores = await getStudentScores(studentsInfo.id_etu);

		const semestreScores = Array.from({ length: 6 }, () => []);

		competences.forEach((competence) => {
			const score = scores.find(s => s.id_comp === competence.id_comp);
			if (score) {
				const semestreIndex = competence.id_semestre - 1;
				semestreScores[semestreIndex].push(score.moyenne_comp || 0);
			}
		});

		const allStudentScores = await getAllStudentsScores();
		const allCompetenceScores = {}

		allStudentScores.forEach((studentScores) => {
			if (!allCompetenceScores[studentScores.id_comp]) {
				allCompetenceScores[studentScores.id_comp] = [];
			}
			allCompetenceScores[studentScores.id_comp].push(studentScores.moyenne_comp);
		});

		const calculateRank = (score, scoresArray) => {
			scoresArray.push(score);
			scoresArray.sort((a, b) => b - a);
			const rank = scoresArray.indexOf(score);
			scoresArray.pop();
			return rank;
		};

		const drawTextWithOffset = (text, x, y, offset, index) => {
			page.drawText(text, { x: x, y: y - 4 * (offset + 3.7 * index), size: 10, font: font, color: color });
		};

		niveau_X = 230;
		niveau_Y = 66.6;

		semestreScores.forEach((scores, semesterIndex) => {
			if (semesterIndex % 2 === 0 && semesterIndex < semestreScores.length - 1) {
				const nextSemesterScores = semestreScores[semesterIndex + 1];
				scores.forEach((score, index) => {
					const nextSemesterScore = nextSemesterScores[index] || 0;
					if (nextSemesterScore !== undefined) {
						const updatedScore = (parseFloat(score) + parseFloat(nextSemesterScore)) / 2;
						const rank = calculateRank(updatedScore.toFixed(2), allCompetenceScores[index + 1]);
						if (semesterIndex === 4 && index === 2) {
							niveau_Y += 11;
						}
						drawTextWithOffset(updatedScore.toFixed(2) + '', niveau_X, height, niveau_Y, index);
						if (semesterIndex >= 4) {
							drawTextWithOffset(rank + '', niveau_X + 65, height, niveau_Y, index);
						} else {
							drawTextWithOffset(rank + '', niveau_X + 40, height, niveau_Y, index);
						}
					}
				});
			}
			if (semesterIndex < 2) {
				niveau_X += 36;
			} else {
				niveau_X = 270;
				niveau_Y = 108.5;
			}
		});

		const modules = await getModules();
		const moduleR106 = modules.find(m => m.label === 'BINR106');
		const moduleR107 = modules.find(m => m.label === 'BINR107');
		const moduleR207 = modules.find(m => m.label === 'BINR207');
		const moduleR208 = modules.find(m => m.label === 'BINR208');
		const moduleR209 = modules.find(m => m.label === 'BINR209');
		const moduleR308 = modules.find(m => m.label === 'BINR308');
		const moduleR309 = modules.find(m => m.label === 'BINR309');
		const moduleR412 = modules.find(m => m.label === 'BINR412');
		const moduleR511 = modules.find(m => m.label === 'BINR511');
		const moduleR512 = modules.find(m => m.label === 'BINR512');
		const moduleR110 = modules.find(m => m.label === 'BINR110');
		const moduleR212 = modules.find(m => m.label === 'BINR212');
		const moduleR312 = modules.find(m => m.label === 'BINR312');
		const moduleR405 = modules.find(m => m.label === 'BINR405');
		const moduleR514 = modules.find(m => m.label === 'BINR514');

		const coefficients = await getCoefficents();
		const coeffR106 = coefficients.find(c => c.id_module === moduleR106.id_module);
		const coeffR107 = coefficients.find(c => c.id_module === moduleR107.id_module);
		const coeffR207 = coefficients.find(c => c.id_module === moduleR207.id_module);
		const coeffR208 = coefficients.find(c => c.id_module === moduleR208.id_module);
		const coeffR209 = coefficients.find(c => c.id_module === moduleR209.id_module);
		const coeffR308 = coefficients.find(c => c.id_module === moduleR308.id_module);
		const coeffR309 = coefficients.find(c => c.id_module === moduleR309.id_module);
		const coeffR412 = coefficients.find(c => c.id_module === moduleR412.id_module);
		const coeffR511 = coefficients.find(c => c.id_module === moduleR511.id_module);
		const coeffR512 = coefficients.find(c => c.id_module === moduleR512.id_module);
		const coeffR110 = coefficients.find(c => c.id_module === moduleR110.id_module);
		const coeffR212 = coefficients.find(c => c.id_module === moduleR212.id_module);
		const coeffR312 = coefficients.find(c => c.id_module === moduleR312.id_module);
		const coeffR405 = coefficients.find(c => c.id_module === moduleR405.id_module);

		const etumodules = await getEtumodules();
		const etumoduleR106 = etumodules.find(e => e.id_coef === coeffR106.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR107 = etumodules.find(e => e.id_coef === coeffR107.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR207 = etumodules.find(e => e.id_coef === coeffR207.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR208 = etumodules.find(e => e.id_coef === coeffR208.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR209 = etumodules.find(e => e.id_coef === coeffR209.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR308 = etumodules.find(e => e.id_coef === coeffR308.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR309 = etumodules.find(e => e.id_coef === coeffR309.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR412 = etumodules.find(e => e.id_coef === coeffR412.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR511 = etumodules.find(e => e.id_coef === coeffR511.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR512 = etumodules.find(e => e.id_coef === coeffR512.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR110 = etumodules.find(e => e.id_coef === coeffR110.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR212 = etumodules.find(e => e.id_coef === coeffR212.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR312 = etumodules.find(e => e.id_coef === coeffR312.id_coef && e.id_etu === studentsInfo.id_etu) || 0;
		const etumoduleR405 = etumodules.find(e => e.id_coef === coeffR405.id_coef && e.id_etu === studentsInfo.id_etu) || 0;

		const moyenne = ((parseFloat(etumoduleR106.note) || 0) + (parseFloat(etumoduleR107.note) || 0) + (parseFloat(etumoduleR207.note) || 0) + (parseFloat(etumoduleR208.note) || 0) + (parseFloat(etumoduleR209.note) || 0)) / 5;
		const moyenneBUT2 = ((parseFloat(etumoduleR308.note) || 0) + (parseFloat(etumoduleR309.note) || 0) + (parseFloat(etumoduleR412.note) || 0)) / 3;
		const moyenneBUT3 = ((parseFloat(etumoduleR511.note) || 0) + (parseFloat(etumoduleR512.note) || 0)) / 2;
		const moyenneAnglais = ((parseFloat(etumoduleR110.note) || 0) + (parseFloat(etumoduleR212.note) || 0)) / 2;
		const moyenneAnglaisBUT2 = ((parseFloat(etumoduleR312.note) || 0) + (parseFloat(etumoduleR405.note) || 0)) / 2;

		niveau_X = 259;
		page.drawText(moyenne.toFixed(2) + '', { x: niveau_X - 28, y: height - 4 * 89, size: 10, font: font, color: color });
		niveau_X = 330;
		page.drawText(moyenneBUT2.toFixed(2) + '', { x: niveau_X - 28, y: height - 4 * 89, size: 10, font: font, color: color });
		niveau_X = 309;
		page.drawText(moyenneBUT3.toFixed(2) + '', { x: niveau_X - 38, y: height - 4 * 130.5, size: 10, font: font, color: color });

		niveau_X = 259;
		page.drawText(moyenneAnglais.toFixed(2) + '', { x: niveau_X - 28, y: height - 4 * 92, size: 10, font: font, color: color });
		niveau_X = 330;
		page.drawText(moyenneAnglaisBUT2.toFixed(2) + '', { x: niveau_X - 28, y: height - 4 * 92, size: 10, font: font, color: color });

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

async function getStudentScores(studentId) {
	const response = await fetch(`http://localhost:8000/api/etuComp/${studentId}`);
	return response.json();
}

async function getAbsencesEtudiant(etudiantId) {
	const response = await fetch(`http://localhost:8000/api/etuSemestre/${etudiantId}`);
	return response.json();
}

async function getAllStudentsScores() {
	const response = await fetch('http://localhost:8000/api/etuComp');
	return response.json();
}

async function getModules() {
	const response = await fetch('http://localhost:8000/api/module');
	return response.json();
}

async function getCoefficents() {
	const response = await fetch('http://localhost:8000/api/coefficient');
	return response.json();
}

async function getEtumodules() {
	const response = await fetch('http://localhost:8000/api/etuModule');
	return response.json();
}