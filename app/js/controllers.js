'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {

  	var wavesurfer = Object.create(WaveSurfer);
		// Initialize it with a container element (plus some options):

		wavesurfer.init({
		    container: '#wave',
		    waveColor: 'violet',
		    progressColor: 'purple'
		});
		// Subscribe to some events:

		wavesurfer.on('ready', function () {
		    wavesurfer.play();
		});
		// Load an audio file from a URL:

		wavesurfer.load('audio/coldplay-magic.mp3');
  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
