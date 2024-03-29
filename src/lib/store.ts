import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { writable } from 'svelte/store';
import { auth } from './firebase/firebase';
import { deletePhoto, downloadPhotos } from './firebase/photos';
import { addValuation, readValuations } from './firebase/valuations';
import type { IHeatForm } from './interfaces/forms/heat';
import type { INoiseForm } from './interfaces/forms/noise';
import type { IVibrationForm } from './interfaces/forms/vibration';
import type { IChemicalAgentsForm } from './interfaces/forms/chemicalAgents';

export interface UserStore {
	user: User | null;
	loading: boolean;
}

export interface ValuationStore {
	loading: boolean;
}

export interface PhotosStore {
	photosUrls: Array<string> | undefined;
	loading: boolean;
	valuationId: string;
}

export const userStore = writable<UserStore>({
	user: null,
	loading: true
});

export const photosStore = writable<PhotosStore>({
	photosUrls: undefined,
	loading: true,
	valuationId: ''
});

export const valuationStore = writable<ValuationStore>({
	loading: true
});

export const authHandlers = {
	login: async (email: string, password: string) =>
		await signInWithEmailAndPassword(auth, email, password),
	logout: async () => await signOut(auth)
};

export const valuationsHandlers = {
	add: async (form: IHeatForm | INoiseForm | IVibrationForm | IChemicalAgentsForm) =>
		await addValuation(form),
	read: async (uid: string) => await readValuations(uid)
};

export const photosHandlers = {
	read: async (valuationId: string) => await downloadPhotos(valuationId),
	['delete']: async (photoUrl: string) => await deletePhoto(photoUrl)
};
