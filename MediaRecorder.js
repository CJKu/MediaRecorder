var mMediaStream;
var mMediaStream2;
var mMediaRecorder2;
var mBlob;
var audioReplay = document.createElement('audio');
var audioout = document.createElement('audio');
function gUM() {
  navigator.mozGetUserMedia({audio:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
                         Start(1000);
                         Stop();
                         Start(1000);
                         Stop();
                       },
                       function(e) {dump(e)});
}

function gFakeGUM() {
  navigator.mozGetUserMedia({audio:true, fake:true},
                       function(s) {
                         mMediaStream = s;
                         document.getElementById('mediastream').value  = mMediaStream;
                       },
                       function(e) {dump(e)});
}

function gUM2() {
  navigator.mozGetUserMedia({audio:true},
                       function(s) {
                         mMediaStream2 = s;
                         document.getElementById('mediastream').value  = mMediaStream2;
                       },
                       function(e) {dump(e)});
}

function dataavailablecb(aData) {
  mBlob = new Blob([mBlob, aData.data], {type: 'audio/ogg'});
  document.getElementById('size').value  = mBlob.size;
}

function errorcb(e) {
  alert(e);
}

function stopcb() {
  document.getElementById('status').value  = mMediaRecorder.state;
}

function getAudioContext() {
  var context = new AudioContext();
  var buffer = context.createBuffer(1, 409600, context.sampleRate);
  for (var i = 0; i < 409600; ++i) {
    buffer.getChannelData(0)[i] = Math.sin(1000 * 2 * Math.PI * i / context.sampleRate);
  }

  var source = context.createBufferSource();
  source.buffer = buffer;

  var dest = context.createMediaStreamDestination();
  source.connect(dest);
  var elem = document.getElementById('audioelem');
  elem.mozSrcObject = dest.stream;
  mMediaStream = dest.stream;
  source.start(0);
  elem.play();

}

function getAudioTag() {
  var a = document.getElementById('audioelem');
  a.src = "dtmfmono48k.ogg";
  audioout.mozSrcObject = a.mozCaptureStreamUntilEnded();
  mMediaStream = a.mozCaptureStreamUntilEnded();
  a.play();
  document.body.appendChild(audioout);
  audioout.play();
}

function getAudioTagNo() {
  var a = document.getElementById('audioelem');
  a.src = "big.wav";
  audioout.mozSrcObject = a.mozCaptureStreamUntilEnded();
  mMediaStream = a.mozCaptureStreamUntilEnded();
  a.play();
  document.body.appendChild(audioout);
  audioout.play();
}

function Start(time) {
  if (mMediaRecorder == null)
    mMediaRecorder = new MediaRecorder(mMediaStream);
  else if (mMediaRecorder.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob = null;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = dataavailablecb;
  mMediaRecorder.onerror = errorcb;
  mMediaRecorder.start(time);
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Start0WithEvent() {
  if (mMediaRecorder == null)
    mMediaRecorder = new MediaRecorder(mMediaStream);
  else if (mMediaRecorder.state != "inactive") {
    alert("mMediaRecorder is not inactive, stop it first");
    return;
  }
  mBlob = null;
  mMediaRecorder.onstop = stopcb;
  mMediaRecorder.ondataavailable = function(e) {
                                                mMediaRecorder.requestData();
                                                dataavailablecb(e);
                                                console.log(e);}
  mMediaRecorder.onerror = errorcb;
  mMediaRecorder.start(0);
  mMediaRecorder.requestData();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Stop() {
  mMediaRecorder.stop();
}

function Resume() {
  mMediaRecorder.resume();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Pause() {
  mMediaRecorder.pause();
  document.getElementById('status').value  = mMediaRecorder.state;
}

function Playback() {
  _FReader = new FileReader();
  _FReader.readAsDataURL(mBlob);
  _FReader.onload = function (_FREvent) {
    audioReplay.src = _FREvent.target.result;
    audioReplay.play();
  };
}

function PlaybackIDX() {
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || { READ_WRITE: 'readwrite' } ;
        var request = indexedDB.open("creatures", 2);
        request.onsuccess = function(event) {
          indexedDB.db = event.target.result;
        var transaction = indexedDB.db.transaction(["ogg"], "readwrite");

        transaction.objectStore("ogg").get("audio").onsuccess = function (event) {
                var audioblob = event.target.result;
                console.log("Got blob!" + audioblob.size);
                _FReader = new FileReader();
                _FReader.readAsDataURL(audioblob);
                _FReader.onload = function (_FREvent) {
                  audioReplay.src = _FREvent.target.result;
                  audioReplay.play();
                };
        };
        indexedDB.db.close();
        }
}

function Save() {
        if (!mBlob) {
          alert("no audio blob");
        }
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || { READ_WRITE: 'readwrite' } ;

        var request = indexedDB.open("creatures", 2);
        request.onupgradeneeded = function () {
           request.result.createObjectStore("ogg");
        };
        request.onerror = function(event) {
          alert(event);
        }
        request.onsuccess = function(event) {
          indexedDB.db = event.target.result;
        var transaction = indexedDB.db.transaction(["ogg"], "readwrite");
        transaction.objectStore("ogg").put(mBlob, "audio");
        indexedDB.db.close();
        }
}
var mMediaRecorder;
var mStopCount = 0;

function dataAvaliableCallback(data) {
  document.getElementById('size').value  = "!!!!";
}

function stopCallback() {
  // If the number of stopCallback is not equal to the number of stopRecording call
  // test failed.
  mStopCount++;

  document.getElementById('status').value  =  "Stop : (" + mStopCount + ")"; 
}


function errorCallback() {
  // Test fail
  document.getElementById('status').value  =  "Error"; 
}

function startRecording(time) {
  // Setup event handlers.
  mMediaRecorder.onstop = stopCallback;
  mMediaRecorder.ondataavailable = dataAvaliableCallback;
  mMediaRecorder.onerror = errorCallback;

  // Start recording.
  mMediaRecorder.start(time);
}
    
function stopRecording() {
  mMediaRecorder.stop();
}

function StopClick() {
  mMediaRecorder.stop();
}

window.onload = function() {
  document.getElementById("Start").onclick = function() { startRecording(1000); };
  document.getElementById("Stop").onclick = function() { StopClick(); };
  navigator.mozGetUserMedia({audio:true, fake:true},
    function(s) {
      mMediaRecorder = new MediaRecorder(s);
      startRecording(1000);
      stopRecording();
      startRecording(1000);
      stopRecording();
      startRecording(1000);
      stopRecording();
      // We should recieve at last two on stop callback.
      //startRecording(1000);
    },
    function(e) {
      dump(e);
    }
  );
};
