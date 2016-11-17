module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
	// Which plugins to enable
    reporters: ['spec'],
    files: [
      'https://code.jquery.com/jquery-1.12.4.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
      'assets/js/bgseo/boldgrid-seo-util.js',
	  'assets/js/bgseo/boldgrid-seo-init.js',
      'tests/*.js'
    ]
  });
};