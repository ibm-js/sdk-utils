module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("filterPluginFiles", function (stringRE, outprop) {
		var rel = grunt.config(outprop + ".plugins.rel");
		var abs = grunt.config(outprop + ".plugins.abs");

		function test(path) {
			return !path.match(new RegExp(stringRE));
		}

		grunt.config(outprop + ".plugins.rel", rel.filter(test));
		grunt.config(outprop + ".plugins.abs", abs.filter(test));
	});
};