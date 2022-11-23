const express = require('express');
const app = express();
const port = 8000;

app.use(express.static('static'));
app.use('/js', express.static('dist/build'));
app.listen(port, () => {});