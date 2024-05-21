async function createPdf() {
	const existingPdfBytes = await fetch('./Avis_Poursuite_etudes_modele.pdf').then(res => res.arrayBuffer());
	const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
	
	const page = pdfDoc.getPages()[0];

	const { width, height } = page.getSize();
	const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
	const color = PDFLib.rgb(0, 0, 0);

	const imageBytes = document.getElementById('fileMain').files[0];
	const image = await pdfDoc.embedPng(imageBytes);
	const imageDims = image.scale(0.5);
	page.drawImage(image, {
		x: page.getWidth() / 2 - imageDims.width / 2 - 220,
		y: page.getHeight() / 2 - imageDims.height / 2 + 370,
		width: imageDims.width,
		height: imageDims.height,
	});

	const imageBytes2 = document.getElementById('fileSecondary').files[0];
	const image2 = await pdfDoc.embedPng(imageBytes2);
	const imageDims2 = image2.scale(0.5);
	page.drawImage(image2, {
		x: page.getWidth() / 2 - imageDims2.width / 2 + 210,
		y: page.getHeight() / 2 - imageDims2.height / 2 + 370,
		width: imageDims2.width,
		height: imageDims2.height,
	});

	const imageBytes3 = document.getElementById('fileSign').files[0];
	const image3 = await pdfDoc.embedPng(imageBytes3);
	const imageDims3 = image3.scale(0.1);
	page.drawImage(image3, {
		x: page.getWidth() / 2 - imageDims3.width / 2 + 190,
		y: page.getHeight() / 2 - imageDims3.height / 2 - 380,
		width: imageDims3.width,
		height: imageDims3.height,
	});

	const studentSelect = document.querySelector('.student');
	const studentName = studentSelect.options[studentSelect.selectedIndex].text;

	page.drawText(studentName, { x: 210, y: height - 4 * 35.5, size: 10, font: font, color: color, });

	let niveau_Y = height - 4 * 38.7;
	page.drawText('Non', { x: 251, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText('Oui', { x: 371, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText('Oui', { x: 485, y: niveau_Y, size: 10, font: font, color: color });

	niveau_Y = height - 4 * 41.7;
	page.drawText('Je sais pas', { x: 251, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText('Je sais pas', { x: 371, y: niveau_Y, size: 10, font: font, color: color });
	page.drawText('Je sais pas', { x: 485, y: niveau_Y, size: 10, font: font, color: color });

	let niveau_X = 229;
	niveau_Y = 66.6;
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

	page.drawText('X', { x: 231, y: height - 4 * 157.3, size: 10, font: font, color: color });
	page.drawText('X', { x: 231, y: height - 4 * 162.6, size: 10, font: font, color: color });
	
	page.drawText(document.getElementById('commentaire').value, { x: 120, y: height - 4 * 179, size: 10, font: font, color: color, });

	page.drawText(document.getElementById('department').value, { x: 350, y: height - 4 * 193, size: 10, font: font, color: color, });

	const pdfBytes = await pdfDoc.save();
	const blob = new Blob([pdfBytes], { type: 'application/pdf' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'Avis_Poursuite_Etudes.pdf';
	link.click();
}

document.getElementById('exportStudent').addEventListener('click', createPdf);