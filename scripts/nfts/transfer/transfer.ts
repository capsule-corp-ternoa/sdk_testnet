import * as fs from "fs";
import qrCode from 'qrcode';
const filePath = process.env.JSON_FILE_PATH
if (!filePath) {
    //console.error('No JSON file given')
    process.exit()
}
if (!fs.existsSync(filePath)) {
    //console.error('JSON file does not exist.')
    process.exit()
}

const sendNFT = async () => {
    //console.info('Starting QR local save...');
    const jsonFileContent = fs.readFileSync(filePath) as any;
    
    const transfersList = JSON.parse(jsonFileContent);
    for (const item of transfersList) {
       
        // await new Promise((resolve, reject) => {
        //     qrCode.toFile(destinationPath, qrData, (err) => {
        //         if (err) {
        //             reject()
        //         } else {
        //             //console.info(`QR stored on local file ${destinationPath} with data ${qrData}`)
        //             resolve()
        //         }
        //     });
        // }).catch(e => {
        //     throw new Error(e);
        // });
    }
};
sendNFT()
    .catch(e => {
        //console.error('Error caught:' + e);
    })
    .finally(() => {
        //console.info('process finished');
        process.exit();
    });