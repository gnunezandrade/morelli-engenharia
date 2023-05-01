import { describe, it, expect } from 'vitest';

import suite from '$lib/vestSuites/heat';
import type IHeatForm from '$lib/interfaces/forms/heat';
import getTotalTime from '$lib/utils/getTotalTime';

const form: IHeatForm = {
	company: '',
	date: '',
	sampleNumber: '',
	valuation: '',
	methodology: '',
	name: '',
	function: '',
	sector: '',
	ghe: '',
	epi: '',
	epc: '',
	brand: '',
	model: '',
	serialNumber: '',
	climaticConditions: '',
	environment: '',
	ventilation: '',
	enviromentSolarIncidence: '',
	heatSource: '',
	rest: '',
	activities: '',
	temperature: '',
	humidity: '',
	wind: '',
	startingTime: '',
	endingTime: '',
	totalTime: ''
};

describe('Validates empty fields', () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { temperature, humidity, wind, totalTime, ...requieredFields } = form;

	for (const field in requieredFields) {
		it(`validates an empty ${field} field`, () => {
			const suiteResult = suite(form);
			const fieldErrors = suiteResult.getErrors()[field];

			expect(fieldErrors).toContain('Campo obrigatório');
		});
	}
});

describe('Validates starting and ending time', () => {
	it('validates an invalid starting time', () => {
		const mockForm = { ...form, startingTime: '99:99:99' };

		const suiteResult = suite(mockForm);
		const fieldErrors = suiteResult.getErrors()['startingTime'];

		expect(fieldErrors).toContain('Horário inválido');
	});

	it('validates an invalid ending time', () => {
		const mockForm = { ...form, endingTime: '99:99:99' };

		const suiteResult = suite(mockForm);
		const fieldErrors = suiteResult.getErrors()['endingTime'];

		expect(fieldErrors).toContain('Horário inválido');
	});

	it('calculates total time', () => {
		const startingTime = '14:00:00';
		const endingTime = '15:00:00';

		const totalTime = getTotalTime(startingTime, endingTime);

		expect(totalTime).toBe('01:00:00');
	});

	it('does not calculate an invalid time', () => {
		const startingTime = '99:';
		const endingTime = '14:00';

		const totalTime = getTotalTime(startingTime, endingTime);

		expect(totalTime).toBe('00:00:00');
	});

	it('does not calculate an starting time higher than the ending time', () => {
		const startingTime = '15:00:00';
		const endingTime = '14:00"00';

		const totalTime = getTotalTime(startingTime, endingTime);

		expect(totalTime).toBe('00:00:00');
	});
});