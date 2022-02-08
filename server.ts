import express, { Router } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import * as fs from 'fs';
import cluster, { Worker } from 'cluster'
import userRouter from './app/routes/user.routes';
import ipfsRouter from './app/routes/ipfsRoutes';
import nftRouter from './app/routes/nftRoutes';
import sgxRouter from './app/routes/sgxRoutes';
import capsuleRouter from './app/routes/capsuleRoutes';
import marketPlaceRouter from './app/routes/marketPlaceRoutes';
import os from 'os';
import dotenv from 'dotenv';
import { Server } from 'http';
import path from 'path';
dotenv.config();

const clusterMode = Number(process.env.CLUSTER_MODE) === 1;
export let app: express.Application;
export let server: Server;
const handleMaster = () => {
  app = express()
  /* create directories */
  if (!fs.existsSync('./nftkeys'))
    fs.mkdirSync('./nftkeys');
  if (!fs.existsSync('./uploads'))
    fs.mkdirSync('./uploads');
  if (!fs.existsSync('./tmp'))
    fs.mkdirSync('./tmp');
  if (!fs.existsSync('./faildShamirs'))
    fs.mkdirSync('./faildShamirs');
  if (clusterMode && false) {
    const numCPUs = os.cpus().length;
    let i = 0;
    // cluster.schedulingPolicy = cluster.SCHED_RR;
    while (i < numCPUs) {
      cluster.fork();
      i++;
    }

    cluster.on('exit', function (worker: Worker, _code: number, _signal: string) {
      // Restart the worker
      var worker = cluster.fork();
      // Note the process IDs
      var newPID = worker.process.pid;
      console.log('worker ' + newPID + ' born.');
      if (worker.isDead()) {
        //console.log('worker ' + worker.process.pid + ' died.');
      }
    });
  } else {
    handleChild();
  }

}

 


const handleChild = () => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));
  app.use(fileUpload());
  const router = Router();

  router.use(nftRouter, userRouter, ipfsRouter, sgxRouter, capsuleRouter, marketPlaceRouter);
  app.use(router);
  const PORT = process.env.PORT || 3000;

  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
};
if (clusterMode) {
  if (!cluster.isWorker) {
    handleMaster();
  } else {
    handleChild();
  }
} else {
  handleMaster();
}
