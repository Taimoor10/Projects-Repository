const eventListener = require('./scripts/eventListener').tokenContractInstance;
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/token', require('./routes/token'))

app.listen(3000, () => {

  eventListener.once("Transfer", (_from, _to, _value) => {
    console.log("Transfer: \n", 
                "from:", _from,
                "to:", _to,
                "value:", _value.toString()
                )
  })

  console.log('listening on port 3000....')
})

module.exports = app