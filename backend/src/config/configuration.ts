export default () => ({
  mongo_uri: process.env.MONGO_URI,
  port: process.env.PORT || 6534,
});
