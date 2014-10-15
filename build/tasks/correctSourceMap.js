module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("correctSourceMap", function (layerName, buildCfg, outdir) {
		var buildConfig = grunt.config(buildCfg);
		var path = outdir + buildConfig.layersByName[layerName].outputPath.replace(/\.js$/g, ".map");
		var content = grunt.file.read(path);
		content = content.replace(/\.\.(\/|\\\\)tmp(\/|\\\\)/g, "");
		grunt.file.write(path, content);
	});
};
