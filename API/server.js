const { app } = require('./app');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});