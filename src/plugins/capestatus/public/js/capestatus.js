(function (window, $, undefined) {
  'use strict';
  var Capestatus;
  Capestatus = function Capestatus(cockpit) {
    var self = this;
    console.log('Loading Capestatus plugin in the browser.');
    // Instance variables
    self.cockpit = cockpit;
    self.lastPing = null;

    self.bindingModel = {
      cockpit: self.cockpit
    };

    // Add required UI elements
    var jsFileLocation = urlOfJsFile('capestatus.js');
    $('body').append('<div id="capestatus-templates"></div>')
    $('#capestatus-templates').load(jsFileLocation + '../ui-templates.html', function () {
      $('#footercontent').prepend('<div id="capestatus_footercontent" data-bind="template: {name: \'template_capestatus_footercontent\'}"></div>');
      ko.applyBindings(self.bindingModel, document.getElementById('capestatus_footercontent'));
    });

    $('#servoTilt').append('<img id="servoTiltImage" src="themes/OpenROV/img/servo_tilt.png">');
    $('#navtoolbar').append('<li id="brightnessIndicator" class="level0"></li>');

    // Register the various event handlers
    this.listen();
    var capes = this;
    setInterval(function () {
      capes.updateConnectionStatus();
    }, 1000);
    setInterval(function () {
      $('#localtime').text(new Date().toLocaleTimeString());
    }, 1000);
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Capestatus.prototype.listen = function listen() {
    var capes = this;
    this.cockpit.socket.on('status', function (data) {
      capes.UpdateStatusIndicators(data);
    });
  };
  Capestatus.prototype.batteryLevel = function batteryLevel(voltage) {
    if (voltage < 9)
      return 'level1';
    if (voltage < 10)
      return 'level2';
    if (voltage < 10.5)
      return 'level3';
    if (voltage < 11.5)
      return 'level4';
    return 'level5';
  };
  Capestatus.prototype.UpdateStatusIndicators = function UpdateStatusIndicators(data) {
    var self = this;
    if ('time' in data) {
      $('#formattedRunTime').text(msToTime(data.time));
    }
    if ('vout' in data) {
      $('#currentVoltage').text(data.vout.toFixed(1) + 'v');
      $('#batteryIndicator').attr('class', self.batteryLevel(data.vout));
    }
    if ('iout' in data)
      $('#currentCurrent').text(data.iout.toFixed(3) + 'A');
    if ('servo' in data) {
      var angle = 90 / 500 * data.servo * -1 - 90;
      $('#servoTiltImage').attr('style', '-webkit-transform: rotate(' + angle + 'deg); -moz-transform: rotate(' + angle + 'deg);transform: rotate(' + angle + 'deg)');
    }
    if ('cpuUsage' in data)
      $('#currentCpuUsage').text((data.cpuUsage * 100).toFixed(0) + '%');
    if ('LIGP' in data)
      $('#brightnessIndicator').attr('class', 'level' + Math.ceil(data.LIGP * 10));
    this.lastPing = new Date();
  };
  Capestatus.prototype.updateConnectionStatus = function () {
    var now = new Date();
    var delay = now - this.lastPing;
    if (delay > 3000)
      $('#connectionHealth').attr('class', 'false');
    else
      $('#connectionHealth').attr('class', 'true');
  };
  window.Cockpit.plugins.push(Capestatus);
}(window, jQuery));