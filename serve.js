const express = require('express');
const app = express();
const port = 8000;

app.use(express.static('static'));
app.use(express.static('dist', {path:'dist'}))
app.listen(port, () => {});