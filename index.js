const express = require('express');
const http = require('http');
const kue = require('kue');
const uuidv4 = require('uuid/v4');

const app = express();

const queue = kue.createQueue({
  "prefix": "post",
  "redis": {
    "host": "127.0.0.1",
  }
});

queue.watchStuckJobs(60000);

app.use(kue.app);

app.get('/createtask', (req, res) => {
  console.log('creating task');
  queue.create('firstTask', {
    data: { id: uuidv4() },
  })
    .removeOnComplete(true)
    .ttl(60000)
    .attempts(3)
    .backoff( {type:'exponential'} )
    .save();
  return res.send('ack');
});

const server = http.createServer(app).listen(8000);
