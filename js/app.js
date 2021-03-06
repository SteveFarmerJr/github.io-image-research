//const video = document.getElementById('video');
const video = document.querySelector("#step1 video");
const button = document.getElementById('button');
const select = document.getElementById('select');

let currentStream;

//------------------------------------------Enumerate and Access Device Cams-------------------------------

function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  
  function gotDevices(mediaDevices) {
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
  }
  
  button.addEventListener('click', event => {
    if (typeof currentStream !== 'undefined') {
      stopMediaTracks(currentStream);
    }
    const videoConstraints = {};
    if (select.value === '') {
      videoConstraints.facingMode = 'environment';
    } else {
      videoConstraints.deviceId = { exact: select.value };
    }
    const constraints = {
      video: videoConstraints,
      audio: false
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        currentStream = stream;
        video.srcObject = stream;
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(gotDevices)
      .catch(error => {
        console.error(error);
      });
  });
  
  //call to enumerate
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
  


//------------------Aquisition ---------------------------------------------



(function () {
    var video = document.querySelector('video');

    var pictureWidth = 640;
    var pictureHeight = 360;

    var fxCanvas = null;
    var texture = null;

    function checkRequirements() {
        var deferred = new $.Deferred();

        //Check if getUserMedia is available
        if (!Modernizr.getusermedia) {
            deferred.reject('Your browser doesn\'t support getUserMedia (according to Modernizr).');
        }

        //Check if WebGL is available
        if (Modernizr.webgl) {
            try {
                //setup glfx.js
                fxCanvas = fx.canvas();
            } catch (e) {
                deferred.reject('Sorry, glfx.js failed to initialize. WebGL issues?');
            }
        } else {
            deferred.reject('Your browser doesn\'t support WebGL (according to Modernizr).');
        }

        deferred.resolve();

        return deferred.promise();
    }

    function searchForRearCamera() {
        var deferred = new $.Deferred();

        //MediaStreamTrack.getSources seams to be supported only by Chrome
        if (MediaStreamTrack && MediaStreamTrack.getSources) {
            MediaStreamTrack.getSources(function (sources) {
                var rearCameraIds = sources.filter(function (source) {
                    return (source.kind === 'video' && source.facing === 'environment');
                }).map(function (source) {
                    return source.id;
                });

                if (rearCameraIds.length) {
                    deferred.resolve(rearCameraIds[0]);
                } else {
                    deferred.resolve(null);
                }
            });
        } else {
            deferred.resolve(null);
        }

        return deferred.promise();
    }

    function setupVideo(rearCameraId) {
        var deferred = new $.Deferred();
        var videoSettings = {
            video: {
                optional: [
                    {
                        width: { min: pictureWidth }
                    },
                    {
                        height: { min: pictureHeight }
                    }
                ]
            }
        };

        //if rear camera is available - use it
        if (rearCameraId) {
            videoSettings.video.optional.push({
                sourceId: rearCameraId
            });
        }

        navigator.mediaDevices.getUserMedia(videoSettings)
            .then(function (stream) {
                //Setup the video stream
                video.srcObject = stream;

                video.addEventListener("loadedmetadata", function (e) {
                    //get video width and height as it might be different than we requested
                    pictureWidth = this.videoWidth;
                    pictureHeight = this.videoHeight;

                    if (!pictureWidth && !pictureHeight) {
                        //firefox fails to deliver info about video size on time (issue #926753), we have to wait
                        var waitingForSize = setInterval(function () {
                            if (video.videoWidth && video.videoHeight) {
                                pictureWidth = video.videoWidth;
                                pictureHeight = video.videoHeight;

                                clearInterval(waitingForSize);
                                deferred.resolve();
                            }
                        }, 100);
                    } else {
                        deferred.resolve();
                    }
                }, false);
            }).catch(function () {
                deferred.reject('There is no access to your camera, have you denied it?');
            });

        return deferred.promise();
    }


    //draw picture from video on canvas
    
    $('#fileInput').on('change',function(){
        var canvas = document.querySelector('#step2 canvas');
        // var img = document.querySelector('#step2 img');
    
        //setup canvas
        canvas.width = pictureWidth;
        canvas.height = pictureHeight;
    
        var ctx = canvas.getContext('2d');
    
        var reader = new FileReader();
        reader.onload = function(evt){
            var img = new Image();
            img.onload = function(evt){
            ctx.drawImage(img, 0, 0);                
            }
        }
    });
    // $('#fileInput').on( 'change', function(){
    //     if (this.files && this.files[0]) {
    //       if ( this.files[0].type.match(/^image\//) ) {
    //         var reader = new FileReader();
    //         reader.onload = function(evt) {
    //            var img = new Image();
    //            img.onload = function() {
    //              context.canvas.height = img.height;
    //              context.canvas.width  = img.width;
    //              context.drawImage(img, 0, 0);                                
    //         }
    //     }
    // }}
    
//------------------------------------------------------------REFINEMENT-----------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------
let hflipbutton = document.getElementById('hflipbutton');
let vflipbutton = document.getElementById('vflipbutton');

function flipImage(image, ctx, flipH, flipV) {
    let width = 640;
    let height = 480;
    var img = new Image();

    var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
        scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
        posX = flipH ? width * -1 : 0, // Set x position to -100% if flip horizontal 
        posY = flipV ? height * -1 : 0; // Set y position to -100% if flip vertical

        ctx.save(); // Save the current state
        ctx.scale(scaleH, scaleV); // Set scale to flip the image
        ctx.drawImage(img, posX, posY, width, height); // draw the image
        //ctx.restore(); // Restore the last saved state
}

function flipCap(img,flipH, flipV) {
    var canvas = document.querySelector('#step2 canvas');
    ctx = canvas.getContext('2d');
    var img = $('step2 img');
    flipImage(img, ctx, flipH, flipV);
    return false;
}

//var img = document.querySelector('#step2 img');

$(vflipbutton).click(function(){
        flipCap(false,true);
});  
$(hflipbutton).click(function(){
    var canvas = document.querySelector('#step2 canvas');
    //canvas = fxCanvas;
    var image = document.querySelector('#step2 img');
    var width = image.width;
    var ctx = canvas.getContext('2d');
    ctx.translate(width,0);
    ctx.scale(-1,1);
    ctx.drawImage(image,0,0);
    ctx.restore();
    texture = fxCanvas.texture(canvas);
    fxCanvas.draw(texture).update();
    $('.jcrop-holder img').attr('src', fxCanvas.toDataURL());
    //flipCap(true,false);
});

//------------------------------------------------------------PROCESS--------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------

    function step1() {
        checkRequirements()
            .then(searchForRearCamera)
            .then(setupVideo)
            .done(function () {
                //Enable the 'take picture' button
                $('#takePicture').removeAttr('disabled');
                //Hide the 'enable the camera' info
                $('#step1 figure').removeClass('not-ready');
            })
            .fail(function (error) {
                showError(error);
            });
    }

    function step2() {
        var canvas = document.querySelector('#step2 canvas');
        var img = document.querySelector('#step2 img');

        //setup canvas
        canvas.width = pictureWidth;
        canvas.height = pictureHeight;

        var ctx = canvas.getContext('2d');

        //draw picture from video on canvas
        ctx.drawImage(video, 0, 0);

        //modify the picture using glfx.js filters
        texture = fxCanvas.texture(canvas);
        fxCanvas.draw(texture)
            .hueSaturation(-1, -1)//grayscale
            .unsharpMask(20, 2)
            .brightnessContrast(0.2, 0.9)
            .update();

        window.texture = texture;
        window.fxCanvas = fxCanvas;

        $(img)
            //setup the crop utility
            .one('load', function () {
                if (!$(img).data().Jcrop) {
                    $(img).Jcrop({
                        onSelect: function () {
                            //Enable the 'done' button
                            $('#adjust').removeAttr('disabled');
                        }
                    });
                } else {
                    //update crop tool (it creates copies of <img> that we have to update manually)
                    $('.jcrop-holder img').attr('src', fxCanvas.toDataURL());
                }
            })
            //show output from glfx.js
            .attr('src', fxCanvas.toDataURL());
    }

    function step3() {
        var canvas = document.querySelector('#step3 canvas');
        var step2Image = document.querySelector('#step2 img');
        var cropData = $(step2Image).data().Jcrop.tellSelect();

        var scale = step2Image.width / $(step2Image).width();

        //draw cropped image on the canvas
        canvas.width = cropData.w * scale;
        canvas.height = cropData.h * scale;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(
            step2Image,
            cropData.x * scale,
            cropData.y * scale,
            cropData.w * scale,
            cropData.h * scale,
            0,
            0,
            cropData.w * scale,
            cropData.h * scale);

        var spinner = $('.spinner');
        spinner.show();
        $('blockquote p').text('');
        $('blockquote footer').text('');

        // do the OCR!
        Tesseract.recognize(ctx).then(function (result) {
            var resultText = result.text ? result.text.trim() : '';

            //show the result
            spinner.hide();
            $('blockquote p').html('&bdquo;' + resultText + '&ldquo;');
            $('blockquote footer').text('(' + resultText.length + ' characters)');
        });
    }

//----------------------------------------------------------------------------------------------------------------------------------------
//                                                                        UI/UX 
//----------------------------------------------------------------------------------------------------------------------------------------     

    //start step1 immediately
    step1();
    $('.help').popover();

    function changeStep(step) {
        if (step === 1) {
            video.play();
        } else {
            video.pause();
        }

        $('body').attr('class', 'step' + step);
        $('.nav li.active').removeClass('active');
        $('.nav li:eq(' + (step - 1) + ')').removeClass('disabled').addClass('active');
    }

    function showError(text) {
        $('.alert').show().find('span').text(text);
    }

    //handle brightness/contrast change
    $('#brightness, #contrast').on('change', function () {
        var brightness = $('#brightness').val() / 100;
        var contrast = $('#contrast').val() / 100;
        var img = document.querySelector('#step2 img');

        fxCanvas.draw(texture)
            .hueSaturation(-1, -1)
            .unsharpMask(20, 2)
            .brightnessContrast(brightness, contrast)
            .update();

        img.src = fxCanvas.toDataURL();

        //update crop tool (it creates copies of <img> that we have to update manually)
        $('.jcrop-holder img').attr('src', fxCanvas.toDataURL());
    });

    $('#takePicture').click(function () {
        step2();
        changeStep(2);
    });

    $('#adjust').click(function () {
        step3();
        changeStep(3);
    });

    $('#go-back').click(function () {
        changeStep(2);
    });

    $('#start-over').click(function () {
        changeStep(1);
    });

    $('.nav').on('click', 'a', function () {
        if (!$(this).parent().is('.disabled')) {
            var step = $(this).data('step');
            changeStep(step);
        }

        return false;
    });
})();
