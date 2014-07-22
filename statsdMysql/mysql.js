/*jshint node:true, laxcomma:true */

var util = require('util');
var orm = require("orm");

var models = {}

function ConsoleBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  var mysql_config = config.mysql;
  this.config = config.console || {};
  this.models = {}
  orm.connect("mysql://"+mysql_config.username + ":" + mysql_config.password + "@" + mysql_config.hostname + "/" + mysql_config.database, function (err, db) {
    if (err) throw err;
   models.Step = db.define("step",{
         bucket : String,
	 step: String,
         val: Number
    })
   }) 


  


  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}
/**
keys that we report are keys that are not statsd keys
any key will be seperated to two coulms devide by -
i.e 
the key: ude_201405101#KafkaStep will be converted to bucket=ude_201405101,step=KafkaStep

**/
var createStepFromCounter = function(counters){
     var res=[]
     for (counter in counters){
    
      if (counter.indexOf("statsd") != 0 ){
         
         var step = {}
         var counter_key_parts = counter.split("-")
         console.log(counter_key_parts)
         if (counter_key_parts.length > 1  ){
            step.bucket = counter_key_parts[0];
            step.step = counter_key_parts[1];
         }else {
            step.bucket = counter
         }
         step.val = counters[counter] 
         console.log(step)
         res.push(step)
        }
     }
    return res

}
ConsoleBackend.prototype.flush = function(timestamp, metrics) {
  console.log('Flushing stats at ', new Date(timestamp * 1000).toString());
   var counters = metrics.counters
   //creating the steps
   var steps = createStepFromCounter(counters)


   //reporting the steps
   for (step in steps) {
       var cur = steps[step]
       if (cur.val > 0 ){
          models.Step.create(cur,function (err, message) {
          if (err){console.log("Error:" + message)}
         });
       }
   }

  //var out = {
  //  counters: metrics.counters,
  //  timers: metrics.timers,
  //  gauges: metrics.gauges,
  //  timer_data: metrics.timer_data,
  //  counter_rates: metrics.counter_rates,
  //  sets: function (vals) {
  //    var ret = {};
  //    for (var val in vals) {
  //      ret[val] = vals[val].values();
  //    }
  //    return ret;
  //  }(metrics.sets),
  //  pctThreshold: metrics.pctThreshold
  //};

  //if(this.config.prettyprint) {
  //  console.log(util.inspect(out, false, 5, true));
  //} else {
  //  console.log(out);
  //}

};

ConsoleBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'console', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new ConsoleBackend(startupTime, config, events);
  return true;
};
