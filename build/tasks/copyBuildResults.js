module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("copyBuildResults", function (buildCfg, outdir) {
		var buildConfig = grunt.config(buildCfg);
		var layers = buildConfig.layers;

		// Get directories
		var builtDirs = [];
		layers.forEach(function (layer) {
			var dir = layer.name.match(/^([^\/]*)\//)[1]
			if (dir && builtDirs.indexOf(dir) === -1) {
				builtDirs.push(dir);
			}
		});

		builtDirs.forEach(function (dir, index) {
			// Copy to final destination
			var files = grunt.file.expand({
				dot: true,
				filter: "isFile",
				cwd: outdir + dir
			}, "**/*");
			files.forEach(function (path) {
				var orig = outdir + dir + "/" + path;
				var dest = dir + "-build/" + path;
				grunt.file.copy(orig, dest);
			});
		});
	});
};