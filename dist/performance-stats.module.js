import Stats from 'stats-incremental';

//----------------------------------------------------------------------
// TESTSTATS
//----------------------------------------------------------------------
function index () {

  var firstFrame = true;
  var firstFps = true;

  var currentFrameStartTime = 0;
  var previousFrameEndTime;
  var lastUpdateTime = null;

  // Used to detect recursive entries to the main loop, which can happen in certain complex cases, e.g. if not using rAF to tick rendering to the canvas.
  var insideMainLoopRecursionCounter = 0;

  return {
    getStatsSummary: function () {
      var result = {};
      Object.keys(this.stats).forEach(key => {
        result[key] = {
          min: this.stats[key].min,
          max: this.stats[key].max,
          avg: this.stats[key].mean,
          standard_deviation: this.stats[key].standard_deviation
        };
      });

      return result;
    },

    stats: {
      fps: Stats(),
      dt: Stats(),
      cpu: Stats()        
    },

    numFrames: 0,
    log: true,
    totalTimeInMainLoop: 0,
    totalTimeOutsideMainLoop: 0,
    fpsCounterUpdateInterval: 200, // msecs

    frameStart: function() {
      insideMainLoopRecursionCounter++;
      if (insideMainLoopRecursionCounter == 1) 
      {
        if (lastUpdateTime === null) {
          lastUpdateTime = performance.realNow();
        }

        currentFrameStartTime = performance.realNow();
        this.updateStats();
      }
    },

    updateStats: function() {
      var timeNow = performance.realNow();

      this.numFrames++;

      if (timeNow - lastUpdateTime > this.fpsCounterUpdateInterval)
      {
        var fps = this.numFrames * 1000 / (timeNow - lastUpdateTime);
        this.numFrames = 0;
        lastUpdateTime = timeNow;

        if (firstFps)
        {
          firstFps = false;
          return;
        }

        this.stats.fps.update(fps);

        if (this.log) {
          console.log(`fps - min: ${this.stats.fps.min.toFixed(2)} / avg: ${this.stats.fps.mean.toFixed(2)} / max: ${this.stats.fps.max.toFixed(2)} - std: ${this.stats.fps.standard_deviation.toFixed(2)}`);
          console.log(`ms  - min: ${this.stats.dt.min.toFixed(2)} / avg: ${this.stats.dt.mean.toFixed(2)} / max: ${this.stats.dt.max.toFixed(2)} - std: ${this.stats.dt.standard_deviation.toFixed(2)}`);
          console.log(`cpu - min: ${this.stats.cpu.min.toFixed(2)}% / avg: ${this.stats.cpu.mean.toFixed(2)}% / max: ${this.stats.cpu.max.toFixed(2)}% - std: ${this.stats.cpu.standard_deviation.toFixed(2)}%`);
          console.log('---------------------------------------------------------');  
        }
      }
    },

    // Called in the end of each main loop frame tick.
    frameEnd: function() {
      insideMainLoopRecursionCounter--;
      if (insideMainLoopRecursionCounter != 0) return;

      var timeNow = performance.realNow();
      var cpuMainLoopDuration = timeNow - currentFrameStartTime;
      var durationBetweenFrameUpdates = timeNow - previousFrameEndTime;
      previousFrameEndTime = timeNow;
  
      if (firstFrame) {
        firstFrame = false;
        return;
      }

      this.totalTimeInMainLoop += cpuMainLoopDuration;
      this.totalTimeOutsideMainLoop += durationBetweenFrameUpdates - cpuMainLoopDuration;

      var cpu = cpuMainLoopDuration * 100 / durationBetweenFrameUpdates;
      this.stats.cpu.update(cpu);
      this.stats.dt.update(durationBetweenFrameUpdates);
    }
  }
}

export default index;
