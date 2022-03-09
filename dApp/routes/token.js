const router = require("express").Router()
const transfer = require("../controllers/token/transfer/transfer")
const balanceOf = require("../controllers/token/balanceOf/balanceOf")

module.exports = router

router.post('/transfer', async(req, res) => {
    const address = req.query.address
    const amount = req.query.amount

    try{
        transfer({address, amount}).then(status => {
            res.status(200).send({status})
        })
    }
    catch(err)
    {
        res.sendStatus(500).send()
    }
})

router.get('/balanceOf', async(req, res) => {
    const address = req.query.address

    try{
        balanceOf({address}).then(balance => {
            res.send({balance})
        })

    }catch(err)
    {
        console.error(err)
        res.sendStatus(500).send()
    }
})