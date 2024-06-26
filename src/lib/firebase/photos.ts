import { photosStore, type PhotosStore } from '$lib/store';
import { deleteObject, getDownloadURL, listAll, ref, uploadString } from 'firebase/storage';
import { storage } from './firebase';

export const uploadPhoto = async (base64: string, valuationId: string) => {
	const metadata = {
		contentType: 'image/jpeg'
	};

	const storageRef = ref(storage, `valuationPhotos/${valuationId}/`);
	const storageSize = (await listAll(storageRef)).items.length;

	if (storageSize > 4) {
		throw new Error('Max of 5 photos for each valuation');
	}

	const photoRef = ref(storage, `valuationPhotos/${valuationId}/${storageSize + 1}`);

	uploadString(photoRef, base64, 'base64', metadata);
};

export const downloadPhotos = async (valuationId?: string) => {
	let currentPhotosStore: PhotosStore = {} as PhotosStore;
	photosStore.subscribe((store) => (currentPhotosStore = store));

	photosStore.update((curr) => ({ ...curr, loading: true }));

	const storageRef = ref(
		storage,
		`valuationPhotos/${valuationId || currentPhotosStore.valuationId}/`
	);

	listAll(storageRef)
		.then(async (res) => {
			const { items } = res;
			const urls = await Promise.all(items.map((item) => getDownloadURL(item)));
			const names = await Promise.all(items.map((item) => item.name));

			console.log(urls);

			photosStore.update((curr) => ({
				photosUrls: urls,
				names,
				loading: false,
				valuationId: valuationId ? valuationId : curr.valuationId
			}));
		})
		.catch((error) => {
			console.error(error);
		});
};

export const deletePhoto = async (valuation: string, name: string) => {
	const photoRef = ref(storage, `valuationPhotos/${valuation}/${name}`);

	deleteObject(photoRef)
		.then(() => {
			downloadPhotos();
		})
		.catch((error) => {
			console.error(error);
		});
};
