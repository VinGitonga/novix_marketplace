export default () => ({
	mongo_uri: process.env.MONGO_URI,
	port: process.env.PORT || 6534,
	pinata: {
		jwt: process.env.PINATA_JWT,
		gateway: process.env.PINATA_GATEWAY,
	},
});
