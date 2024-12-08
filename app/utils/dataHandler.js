const tempStorage = {};

export const storeData = (key, data) => {
	tempStorage[key] = data;
};
export const clearData = (key) => {
	delete tempStorage[key];
};
export const getData = (key) => tempStorage[key];
