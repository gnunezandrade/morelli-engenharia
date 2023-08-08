describe('Heat Valuation', () => {
	beforeEach('login', () => {
		cy.visit('/');
		cy.get('[data-cy="input-email"]').type('gabriel@email.com');
		cy.get('[data-cy="input-password"]').type('123456');
		cy.get('[data-cy="signing-button"]').click();
	});

	it('Fills the entire form and saves the valuation on Firestore', () => {
		cy.url().should('include', 'home');
		cy.visit('/nova-avaliacao/calor');
		cy.intercept({
			method: 'GET',
			url: /.*localhost:8080.*/gm
		}).as('firestore');

		cy.get('[data-cy*="input"][data-cy-type="text"]').each((el) => cy.wrap(el).type('Teste'));
		cy.get('[data-cy*="input"][data-cy-type="date"]').each((el) => cy.wrap(el).type('01/01/2023'));
		cy.get('[data-cy*="input"][data-cy-type="time"]').each((el, i) =>
			cy.wrap(el).type(`${14 + i}:00:00`)
		);
		cy.get('[data-cy*="radio"]').each((el) => cy.wrap(el).click());
		cy.get('[data-cy="button-submit"]').each((el) => cy.wrap(el).click());

		cy.wait('@firestore');
	});

	it('Fills only the required fields an saves the valuation on Firestore', () => {
		const notRequiredFields = ['temperature', 'humidity', 'wind'];
		const checkIfItsRequired = (el: JQuery<HTMLElement>) => {
			const name = el.attr('name');

			if (!name) return;

			return notRequiredFields.includes(name) ? true : false;
		};
		cy.url().should('include', 'home');
		cy.visit('/nova-avaliacao/calor');
		cy.intercept({
			method: 'GET',
			url: /.*localhost:8080.*/gm
		}).as('firestore');

		cy.get('[data-cy*="input"][data-cy-type="text"]').each(
			(el) => !checkIfItsRequired(el) && cy.wrap(el).type('Teste')
		);
		cy.get('[data-cy*="input"][data-cy-type="date"]').each(
			(el) => !checkIfItsRequired(el) && cy.wrap(el).type('01/01/2023')
		);
		cy.get('[data-cy*="input"][data-cy-type="time"]').each(
			(el, i) => !checkIfItsRequired(el) && cy.wrap(el).type(`${14 + i}:00:00`)
		);
		cy.get('[data-cy*="radio"]').each((el) => !checkIfItsRequired(el) && cy.wrap(el).click());
		cy.get('[data-cy="button-submit"]').each((el) => cy.wrap(el).click());

		cy.wait('@firestore');
	});
	it('Fails to submit the form without filling any field', () => {
		const requiredFields = 23;
		cy.url().should('include', 'home');
		cy.visit('/nova-avaliacao/calor');
		cy.intercept(
			{
				method: 'GET',
				url: /.*localhost:8080.*/gm
			},
			cy.spy().as('firestore')
		);

		cy.get('[data-cy="button-submit"]').each((el) => cy.wrap(el).click());
		cy.get('[data-cy="span-error-message"]').should('have.length', requiredFields);

		cy.get('@firestore').should('not.have.been.called');
	});
});

export {};
