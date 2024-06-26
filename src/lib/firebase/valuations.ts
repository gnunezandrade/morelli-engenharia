import type IHeatValuationDoc from '$lib/interfaces/firebase/docs';
import type { IHeatForm } from '$lib/interfaces/forms/heat';
import type { INoiseForm } from '$lib/interfaces/forms/noise';
import { userStore, valuationStore, type UserStore } from '$lib/store';
import {
	addDoc,
	collection,
	doc,
	FirestoreError,
	getDocs,
	orderBy,
	query,
	updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { IVibrationForm } from '$lib/interfaces/forms/vibration';
import type { IChemicalAgentsForm } from '$lib/interfaces/forms/chemicalAgents';

export const addValuation = async (
	valuation: IHeatForm | INoiseForm | IVibrationForm | IChemicalAgentsForm
) => {
	let currentUserStore: UserStore = {
		loading: true,
		user: null
	};

	userStore.subscribe((store) => (currentUserStore = store));

	if (!currentUserStore.user) {
		throw new Error('Adding a valuation requires authentication');
	}

	try {
		const valuationsRef = collection(db, 'technitians', currentUserStore.user.uid, 'valuations');
		await addDoc(valuationsRef, valuation);
	} catch (error) {
		const firestoreError = error as FirestoreError;
		throw new Error(firestoreError.message);
	}
};

export const readValuations = async (userId: string) => {
	const valuationsRef = collection(db, 'technitians', userId, 'valuations');
	const queryOrder = orderBy('date', 'desc');

	const valuationsQuery = query(valuationsRef, queryOrder);
	const valuationsSnapshot = await getDocs(valuationsQuery);

	const documents = valuationsSnapshot.docs;
	const valuations = documents.map((doc) => ({
		id: doc.id,
		data: { ...doc.data() }
	})) as IHeatValuationDoc[];

	valuationStore.set({ loading: false, userValuations: valuations });

	return valuations;
};

export const updateValuations = async (userId: string, valuationId: string, form: object) => {
	const valuationsRef = doc(db, 'technitians', userId, 'valuations', valuationId);

	await updateDoc(valuationsRef, form);
};
