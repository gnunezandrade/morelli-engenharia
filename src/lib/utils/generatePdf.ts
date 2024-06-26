import { heatLabels, heatSections, type IHeatForm } from '$lib/interfaces/forms/heat';
import jsPDF from 'jspdf';
import encondedImage from '$lib/images/morelli_logo.json';
import { EValuationTypesDisplayName } from '$lib/interfaces/forms/common';
import { noiseLabels, noiseSections, type INoiseForm } from '$lib/interfaces/forms/noise';
import { vibrationLabels, vibrationSections } from '$lib/interfaces/forms/vibration';
import { chemicalAgentsLabels, chemicalAgentsSections } from '$lib/interfaces/forms/chemicalAgents';

const logoWidth = 58;
const logoHeight = 16;
const xMargin = 10;
const yMargin = 10;
const textGap = 1.75;

const sections = {
	heat: heatSections,
	noise: noiseSections,
	vibration: vibrationSections,
	chemicalAgents: chemicalAgentsSections
};

const labels = {
	heat: heatLabels,
	noise: noiseLabels,
	vibration: vibrationLabels,
	chemicalAgents: chemicalAgentsLabels
};

export const generatePdf = (valuation: IHeatForm | INoiseForm, techniciansName: string) => {
	const doc = new jsPDF();

	const form = { ...valuation, date: valuation.date.toDate().toLocaleDateString('pt-BR') };

	let fontSize = 15;
	const lineHeight = fontSize * 0.3;

	const changeFontSize = (newSize: number) => {
		doc.setFontSize(newSize);
		fontSize = newSize;
	};

	const trimText = (text: string, maxWidth: number) => {
		if (doc.getTextWidth(text) > maxWidth) {
			return doc.splitTextToSize(text, maxWidth)[0];
		} else {
			return text;
		}
	};

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const headerHeight = lineHeight * 6 + yMargin + textGap * 5;
	const maxHeaderTextWidth = pageWidth - logoWidth - xMargin * 2;
	const maxBodyTextWidth = pageWidth - xMargin * 2;

	const headerFields = (sections[valuation.type]['header'] as Array<keyof typeof form>).map(
		(field) => {
			const fieldValue = form[field] as string;

			return trimText(fieldValue, maxHeaderTextWidth);
		}
	);

	headerFields.unshift(`Avaliação Quantitativa de ${EValuationTypesDisplayName[form.type]}`);
	headerFields.push(`Número de Amostragem: ${valuation.sampleNumber}`);

	doc.setFillColor(214, 211, 209);
	doc.rect(0, 0, pageWidth, headerHeight, 'F');

	headerFields
		.filter((field) => field !== '')
		.forEach((field, index) => {
			doc.text(field, xMargin, yMargin + (lineHeight + textGap) * index);
		});

	doc.addImage({
		imageData: encondedImage.base64,
		x: pageWidth - logoWidth - xMargin,
		y: yMargin,
		width: logoWidth,
		height: logoHeight
	});

	const sectionMarginTop = 10;
	const fieldMarginTop = 2;
	const lineGap = 5;

	let previousHeight = headerHeight;

	Object.keys(sections[valuation.type]).forEach((key) => {
		const section = key as keyof (typeof sections)[valuation.type];

		if (section === 'header') return;

		fontSize === 10 && changeFontSize(15);

		const fields = sections[valuation.type][section];
		const sectionNameWidth = doc.getTextWidth(key);

		doc.text(key, xMargin, previousHeight + lineHeight + sectionMarginTop);
		doc.setLineWidth(0.5);
		doc.line(
			sectionNameWidth + xMargin + lineGap,
			previousHeight + lineHeight + sectionMarginTop,
			pageWidth - xMargin,
			previousHeight + lineHeight + sectionMarginTop
		);

		previousHeight += lineHeight + sectionMarginTop;

		changeFontSize(10);

		fields.forEach((field) => {
			const label = labels[valuation.type][field as keyof (typeof labels)[valuation.type]];
			const value: string[] = doc.splitTextToSize(
				`${label}: ${String(form[field])}`,
				maxBodyTextWidth
			);
			doc.text(value, xMargin, previousHeight + lineHeight + fieldMarginTop);
			previousHeight += lineHeight * value.length + fieldMarginTop;
		});
	});

	const { evalueted: evaluatedSignature, evaluator: evaluatorSignature } = form.signatures;

	if (evaluatorSignature != '') {
		doc.addImage({
			imageData: evaluatorSignature,
			x: xMargin,
			y: pageHeight - lineHeight * 3 - 15,
			width: 40,
			height: 15
		});
	}

	doc.text(
		techniciansName,
		(80 - doc.getTextWidth('Responsável Técnico avaliador')) / 2 + xMargin,
		pageHeight - lineHeight * 2
	);

	doc.text(
		'Responsável Técnico avaliador',
		(80 - doc.getTextWidth('Responsável Técnico avaliador')) / 2 + xMargin,
		pageHeight - lineHeight
	);

	if (evaluatedSignature != '') {
		doc.addImage({
			imageData: evaluatedSignature,
			x: pageWidth - xMargin - 40,
			y: pageHeight - lineHeight * 3 - 15,
			width: 40,
			height: 15
		});
	}

	doc.text(
		valuation.name,
		pageWidth - xMargin - 80 + (80 - doc.getTextWidth('Colaborador Avaliado')) / 2,
		pageHeight - lineHeight * 2
	);

	doc.text(
		'Colaborador Avaliado',
		pageWidth - xMargin - 80 + (80 - doc.getTextWidth('Colaborador Avaliado')) / 2,
		pageHeight - lineHeight
	);

	const blob = doc.output('blob');
	const url = URL.createObjectURL(blob);

	return url;
};
