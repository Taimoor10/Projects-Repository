const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/token', require('./routes/token'))

app.listen(3000, () => {
  console.log('listening on port 3000....')
})

module.exports = app