const fs = require("fs");
const qrCode = require('qrcode')
const csvParse = require('csv-parse/lib/sync')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const filePath = process.env.CSV_FILE_PATH,
    outputDir = process.env.OUTPUT_DIR || './qrData',
    delimiter = process.env.CSV_DELIMITER || ',',
    csvReportPath = process.env.CSV_REPORT_PATH || './qrData/report.csv',
    qrExtension = process.env.QR_EXTENSION_FILE || '.jpg',
    csvCols = {
        address: 'address',
        privatekey: 'privatekey'
    },
    csvReportCols = {
        qrFilePath: 'qrFilePath'
    };
if (!filePath) {
    console.error('No CSV file given')
    process.exit()
}
if (!fs.existsSync(filePath)) {
    console.error('CSV file does not exist.')
    process.exit()
}
if (!fs.existsSync(outputDir)) {
    console.error('Destination folder  does not exist. Please create it and restart')
    process.exit()
}
const processQrData = async () => {
    console.info('Starting QR local save...');
    const csvContent = fs.readFileSync(filePath);
    const qrList = csvParse(csvContent, {
        skipEmptyLines: true,
        columns: true,
        delimiter
    });
    const csvReport = createCsvWriter({
        path: csvReportPath,
        header: Object.keys(csvReportCols).map(key => {
            return {
                id: key,
                title: csvReportCols[key]
            }
        })
    });
    const csvReportRecords = [];
    let index = 0;
    for (const item of qrList) {
        const {
            [csvCols.address]: address,
            [csvCols.privatekey]: qrData,
        } = item;
        const destinationPath = `${outputDir}/${index}.${qrExtension}`;
        await new Promise((resolve, reject) => {
            qrCode.toFile(destinationPath, qrData, (err) => {
                if (err) {
                    reject()
                } else {
                    console.info(`QR stored on local file ${destinationPath} with data ${qrData}`)
                    csvReportRecords.push({
                        [csvReportCols.qrFilePath]: destinationPath
                    });
                    resolve()
                }
            });
        }).catch(e => {
            throw new Error(e);
        });
        index++;
    }
    console.log('csvReportRecords',csvReportRecords);
    await csvReport.writeRecords(csvReportRecords);
    console.log(`Report saved in ${csvReportPath}`);
};
processQrData()
    .catch(e => {
        console.error('Error caught:' + e);
    })
    .finally(() => {
        console.info('process finished');
        process.exit();
    });