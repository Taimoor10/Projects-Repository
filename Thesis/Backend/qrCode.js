module.exports = function QRcodeGenerator(web3, QRcode){

//Generates QR code
this.generatesQRcode = async(msg) => {

    try{
        // console.log(await QRcode.toString([{data: web3.utils.hexToBytes(web3.utils.toHex(msg)),mode: 'byte'}],
        //                                  {type: 'utf8', errorCorrectionLevel :'H'}))
        await QRcode.toFile('./public/images/image.png', [{data: web3.utils.hexToBytes(web3.utils.toHex(msg)), mode:'byte'}],
                {type: 'png', errorCorrectionLevel: 'H'}, 
                function(err){
                    if(err)
                    {
                        console.log(err)
                    }
                })
    }catch(err)
    {
        console.log(err)
    }
}}
