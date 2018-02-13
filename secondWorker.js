const kue = require('kue');

const queue = kue.createQueue({
  "prefix": "post",
  "redis": {
    "host": "127.0.0.1",
  }
});

queue.watchStuckJobs(60000);

queue.process('firstTask', function(job, done){
  firstTask(job.data, done);
});

queue.process('secondTask', function(job, done){
  secondTask(job.data, done);
});

queue.process('thirdTask', function(job, done){
  thirdTask(job.data, done);
});

function firstTask(job, done) {
  console.log('Executing first task - second worker', job.data.id);
  setTimeout(function(){
    console.log('First task complete - second worker', job.data.id);
    queue.create('secondTask', job)
      .removeOnComplete(true)
      .ttl(60000)
      .attempts(10)
      .backoff( {type:'exponential'} )
      .save();
    done();
  }, 10000);
}

function secondTask(job, done) {
  console.log('Executing second task - second worker', job.data.id);
  setTimeout(function(){
    console.log('Second task complete - second worker', job.data.id);
    queue.create('thirdTask', job)
      .removeOnComplete(true)
      .ttl(60000)
      .attempts(10)
      .backoff( {type:'exponential'} )
      .save();
    done();
  }, 10000);
}

function thirdTask(job, done) {
  console.log('Executing third task - second worker', job.data.id);
  setTimeout(function(){
    console.log('Third task complete - second worker', job.data.id);
    done();
  }, 10000);
}
