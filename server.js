const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();
const app = express();
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
cluster.schedulingPolicy = cluster.SCHED_RR;


const handleMaster = () => {
  /* create directories */

  if (!fs.existsSync('./nftkeys'))
    fs.mkdirSync('./nftkeys');
  if (!fs.existsSync('./uploads'))
    fs.mkdirSync('./uploads');
  if (!fs.existsSync('./tmp'))
    fs.mkdirSync('./tmp');
  if (!fs.existsSync('./faildShamirs'))
    fs.mkdirSync('./faildShamirs');
    
  let i = 0;
  while (i < numCPUs) {
    cluster.fork();
    i++;
  }
  cluster.on('exit', function (worker, code, signal) {
    // Restart the worker
    var worker = cluster.fork();

    // Note the process IDs
    var newPID = worker.process.pid;
    var oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker ' + oldPID + ' died.');
    console.log('worker ' + newPID + ' born.');
  });
}

const handleChild = () => {

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));

  app.use(fileUpload());

  app.get('/', (req, res) => {
    res.send('server is running');
  });

  require("./app/routes/user.routes")(app);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}
if (cluster.isMaster) {
  handleMaster();
} else {
  handleChild();
}