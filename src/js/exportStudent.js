async function loadImage(file) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = () => resolve(fileReader.result);
		fileReader.onerror = () => reject(fileReader.error);
		fileReader.readAsArrayBuffer(file);
	});
}

async function createPdf() {

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

	const studentSelect = document.querySelector('.student');
	const student = studentSelect.options[studentSelect.selectedIndex].text;

	page.drawText(student, { x: 210, y: height - 4 * 35.5, size: 10, font: font, color: color, });

	let niveau_Y = height - 4 * 38.7;

	const studentData = await fetch(`http://localhost:8000/api/etudiant`).then(res => res.json());
	const studentName = student.split('. ')[0];
	const studentPrenom = student.split('. ')[1];
	const studentInfo = studentData.find(student => student.nom_etu === studentName + "." && student.prenom_etu === studentPrenom);
	const isAlternant = studentInfo.alternant;

	page.drawText('Non', { x: 251, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText(isAlternant ? 'Oui' : 'Non', { x: 371, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText(isAlternant ? 'Oui' : 'Non', { x: 485, y: niveau_Y, size: 10, font: font, color: color });

	niveau_Y = height - 4 * 41.7;
	const year = $(".form-control option:selected").text();
	const yearBefore = (parseInt(year.split('-')[0]) - 1) + '-' + (parseInt(year.split('-')[1]) - 1);
	const yearBefore2 = (parseInt(year.split('-')[0]) - 2) + '-' + (parseInt(year.split('-')[1]) - 2);
	page.drawText(yearBefore2, { x: 251, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText(yearBefore, { x: 371, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText(year, { x: 485, y: niveau_Y, size: 10, font: font, color: color });

	let niveau_X = 229;
	niveau_Y = 66.6;

	async function getCompetenceMoyenne(studentId, semestre, competence) {
		const moyenneData = await fetch(`http://localhost:8000/api/etuComp/`).then(res => res.json());
		const moyenne = moyenneData.find(data => data.id_etu === studentId && data.id_comp === competence);
		return moyenne.moyenne_comp;
	}

	page.drawText('10.05', { x: niveau_X, y: height - 4 * niveau_Y, size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 6), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 7), size: 10, font: font, color: color });

	niveau_X += 46;
	page.drawText('1', { x: niveau_X, y: height - 4 * 66.6, size: 10, font: font, color: color });
	page.drawText('2', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('3', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('4', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('5', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('6', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('7', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 6), size: 10, font: font, color: color });
	page.drawText('8', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 7), size: 10, font: font, color: color });

	niveau_X += 27;
	page.drawText('10.05', { x: niveau_X, y: height - 4 * niveau_Y, size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 6), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 7), size: 10, font: font, color: color });

	niveau_X += 46;
	page.drawText('1', { x: niveau_X, y: height - 4 * 66.6, size: 10, font: font, color: color });
	page.drawText('2', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('3', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('4', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('5', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('6', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('7', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 6), size: 10, font: font, color: color });
	page.drawText('8', { x: niveau_X, y: height - 4 * (66.6 + 3.7 * 7), size: 10, font: font, color: color });

	niveau_X = 259;
	page.drawText('8', { x: niveau_X, y: height - 4 * 96, size: 10, font: font, color: color });
	niveau_X = 330;
	page.drawText('8', { x: niveau_X, y: height - 4 * 96, size: 10, font: font, color: color });

	niveau_X = 270;
	niveau_Y = 108.5;
	page.drawText('10.05', { x: niveau_X, y: height - 4 * niveau_Y, size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('14.00', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 6), size: 10, font: font, color: color });

	niveau_X += 66;
	niveau_Y = 108.5;

	page.drawText('1', { x: niveau_X, y: height - 4 * niveau_Y, size: 10, font: font, color: color });
	page.drawText('2', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 1), size: 10, font: font, color: color });
	page.drawText('3', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 2), size: 10, font: font, color: color });
	page.drawText('4', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 3), size: 10, font: font, color: color });
	page.drawText('5', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 4), size: 10, font: font, color: color });
	page.drawText('6', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 5), size: 10, font: font, color: color });
	page.drawText('7', { x: niveau_X, y: height - 4 * (niveau_Y + 3.7 * 6), size: 10, font: font, color: color });

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
	console.log(avis.tresFavorableMaster);

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

	const pdfBytes = await pdfDoc.save();
	const blob = new Blob([pdfBytes], { type: 'application/pdf' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'Avis_Poursuite_Etudes.pdf';
	link.click();
}

if (document.getElementById('fileUnique').checked) {
	document.getElementById('exportStudent').addEventListener('click', createPdf);
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
