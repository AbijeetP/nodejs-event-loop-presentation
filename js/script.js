/* global Velocity */

function onDOMReady() {
  hljs.initHighlighting();
  var ppt = new NodePresentation();

  document.addEventListener('keydown', function(event) {
   var keyPressed = false;
   if(event.keyCode === 37 || event.keyCode === 38) {
     keyPressed = true;
     ppt.moveBack();
   } else if(event.keyCode === 39 || event.keyCode === 40){
     keyPressed = true;
     ppt.moveForward();
   }
   if(keyPressed) {
     event.preventDefault();
     ppt.stepChanged();
   }
  });

  ppt.stepChanged();

	/*var rect = document.getElementById('rect');
    Velocity(rect, { left: "500px", top: "200px" });
    Velocity(rect, { "backgroundColorGreen" : "255" });
    Velocity(rect, { height: 50, width: 50 });
    Velocity(rect, { rotateZ: 90, scaleX: 0.5 });
    Velocity(rect, "reverse", { delay: 250 });*/
}

document.addEventListener('DOMContentLoaded', onDOMReady);

var NodePresentation = function() {
  var _currentStep = 0;
  var _lastStep = -1;
  var _finalStep = ElementTracer.length - 1;
  var _showHideDuration = 500;

  var _v8Convo = document.getElementById('dvConvoV8');
  var _libuvConvo = document.getElementById('dvConvoLibuv');
  var _readFileEvent = document.getElementById('tskReadFile');
  var _codeTracer = document.getElementById('codeTracer');

  var _downloadSongEvent = document.getElementById('tskDownloadFile');
  _downloadSongEvent.style.display = "block";

  function stepChanged() {
    // Perform action based on currentStep and last step
    var currentSteps = ElementTracer[_currentStep];
    var lastSteps = getLastStep();

    for(var i = 0; i !== currentSteps.length; ++i) {
      var fnToCall = currentSteps[i].fn;
      // If there was a last step, and last step was equal to current step
      // then skip calling the function.
      if(lastSteps && _.isEqual(lastSteps[i], currentSteps[i])) {
        continue;
      }
      eventsHandle[fnToCall](currentSteps[i]);
    }
  }

  function getLastStep() {
    if(_lastStep <= 0) {
      _lastStep = -1;
      return false;
    } else if (_lastStep >= _finalStep) {
      _lastStep = _finalStep - 1;
      return false;
    } else {
      return ElementTracer[_lastStep];
    }
  }

  function moveForward() {
    if(_currentStep === _finalStep) {
      return;
    }
    _lastStep = _currentStep;
    ++_currentStep;
  }

  function moveBack() {
    if(_currentStep === 0) {
      return;
    }
    _lastStep = _currentStep;
    --_currentStep;
  }

  function showHideElement(currElem, displayArgs) {
    var isHide = false;
    if(displayArgs === 'none') {
      isHide = false;
    }

    if(isHide) {
      Velocity(currElem, {
        opacity : 0
      }, {
        duration : _showHideDuration,
        complete : function() {
          currElem.style.display = 'none';
        }
      });
    } else {
      currElem.style.opacity = 0;
      currElem.style.display = displayArgs;
      Velocity(currElem, {
        opacity : 1
      }, { duration : _showHideDuration });
    }
  }

  function isDisplayStateSame(elem, displayProp) {
    if(elem.style.display === displayProp) {
      return true;
    }
    return false;
  }

  function addClass(elem, classToAdd) {
    elem.classList.add(classToAdd);
  }

  function removeClass(elem, classToRem) {
    elem.classList.remove(classToRem);
  }

  var eventsHandle = {
    handleCodeTrace : function(args) {
      _codeTracer.style.display = args.display;
      if(!args.position) {
        return;
      }
      Velocity(_codeTracer, {
        right : args.position.x +  "px",
        top : args.position.y + "px"
      });
    },
    handleV8Convo : function(args) {
      if(!isDisplayStateSame(_v8Convo, args.display)) {
        showHideElement(_v8Convo, args.display);
      }
    },
    handleReadFile : function(args) {
      // Check if the display state has changed.
      if(!isDisplayStateSame(_readFileEvent, args.display)) {
        showHideElement(_readFileEvent, args.display);
      }
      // Add or remove class.
      if(args.removeClass) {
        removeClass(_readFileEvent, args.removeClass);
      } else if(args.addClass) {
        addClass(_readFileEvent, args.addClass);
      }
    },
    handleLibuvConvo : function(args) {
      // First change the text.
      if(args.text) {
        var para = _libuvConvo.getElementsByTagName('p');
        para[0].innerHTML = args.text;
      }
      if(!isDisplayStateSame(_libuvConvo, args.display)) {
        showHideElement(_libuvConvo, args.display);
      }
    },
    handleDownloadSong : function(args) {
      if(!isDisplayStateSame(_downloadSongEvent, args.display)) {
        showHideElement(_downloadSongEvent, args.display);
      }
    }
  };

  return {
    stepChanged : stepChanged,
    moveForward : moveForward,
    moveBack : moveBack
  };
};

var ElementTracer = [
  [
    { display : "none", fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "none", fn : "handleReadFile"},
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // First tracer appears
    { display : "block", position : { y : 10, x : 0 }, fn : "handleCodeTrace"},
    { display : "none", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "none", fn : "handleReadFile"},
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // Tracer moves to second line
    { display : "block", position : { y : 50, x : 0 }, fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "none", fn : "handleReadFile"},
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // v8 asks Libuv
    { display : "block", position : { y : 50, x : 0 }, fn : "handleCodeTrace" },
    { display : "block", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "none", fn : "handleReadFile"},
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // Libuv says OK
    { display : "block", position : { y : 50, x : 0 }, fn : "handleCodeTrace" },
    { display : "block", fn : "handleV8Convo"},
    { display : "block", fn : "handleLibuvConvo"},
    { display : "none", fn : "handleReadFile"},
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // readFile appears in the event stack, convo disappears
    { display : "block", position : { y : 90, x : 0 }, fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "block", fn : "handleReadFile", removeClass : "current-task" },
    { display : "block", fn : "handleDownloadSong"}
  ],
  [
    // download song disappears
    { display : "block", position : { y : 130, x : 0 }, fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo"},
    { display : "none", fn : "handleLibuvConvo"},
    { display : "block", fn : "handleReadFile", addClass : "current-task" },
    { display : "none", fn : "handleDownloadSong"}
  ],
  [
    { display : "block", position : { y : 170, x : 0 }, fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo"},
    { display : "block", fn : "handleLibuvConvo", text : "Hey, I'm done! <br>Calling <em>cbSettingsRead</em>"},
    { display : "none", fn : "handleReadFile"},
    { display : "none", fn : "handleDownloadSong"}
  ],
  [
    { display : "none", position : { y : 170, x : 0 }, fn : "handleCodeTrace" },
    { display : "none", fn : "handleV8Convo" },
    { display : "none", fn : "handleLibuvConvo" },
    { display : "none", fn : "handleReadFile" },
    { display : "none", fn : "handleDownloadSong" }
  ]
];
