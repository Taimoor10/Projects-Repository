module.exports = function QRcodeGenerator(web3, QRcode){

//Generates QR code
this.generatesQRcode = async(msg) => {

    try{
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
