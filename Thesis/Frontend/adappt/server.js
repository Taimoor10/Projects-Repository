/*
A React server for selective disclosure (Future works)
*/

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/user/selectiveDisclose", (req, res) => {
    let data = req.body
    console.log("Data:",data)
    res.sendStatus(200)
});

app.get('/',(req,res)=>{
    res.send("Cannot find other routes")
})
app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app