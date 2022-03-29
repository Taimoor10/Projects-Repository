const router = require("express").Router()
const transfer = require("../controllers/token/transfer/transfer")
const balanceOf = require("../controllers/token/balanceOf/balanceOf")
const transferFrom = require("../controllers/token/transferFrom/transferFrom")
const approve = require("../controllers/token/allowance/approve")
const allowance = require("../controllers/token/allowance/allowance")
const increaseAllowance = require("../controllers/token/allowance/increaseAllowance")
const decreaseAllowance = require("../controllers/token/allowance/decreaseAllowance")

module.exports = router

//Transfer
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

router.post('/transferFrom', async(req, res) => {
    const from = req.query.from
    const to = req.query.to
    const value = req.query.value

    try{
        transferFrom({from, to, value}).then(status => {
            res.status(200).send({status})
        })
    }
    catch(err)
    {
        res.sendStatus(500).send()
    }
})

//Allowance
router.post('/approve', async(req, res) => {
    const spender = req.query.spender
    const value = req.query.value

    try{
        approve({spender, value}).then(status => {
            res.status(200).send({status})
        })
    }
    catch(err)
    {
        res.sendStatus(500).send()
    }
})

router.get('/allowance', async(req, res) => {
    const owner = req.query.owner
    const spender = req.query.spender

    try{
        allowance({owner, spender}).then(allowance => {
            res.send({allowance})
        })

    }catch(err)
    {
        console.error(err)
        res.sendStatus(500).send()
    }
})

router.post('/increaseAllowance', async(req, res) => {
    const spender = req.query.spender
    const addedValue = req.query.addedValue

    try{
        increaseAllowance({spender, addedValue}).then(allowance => {
            res.send({allowance})
        })

    }catch(err)
    {
        console.error(err)
        res.sendStatus(500).send()
    }
})

router.post('/decreaseAllowance', async(req, res) => {
    const spender = req.query.spender
    const decreaseValue = req.query.decreaseValue

    try{
        decreaseAllowance({spender, decreaseValue}).then(allowance => {
            res.send({allowance})
        })

    }catch(err)
    {
        console.error(err)
        res.sendStatus(500).send()
    }
})


//Balance
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