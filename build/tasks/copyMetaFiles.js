module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("copyMetaFiles", function (buildCfg, outdir) {
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

		builtDirs.forEach(function (dir) {
			// Copy generic files
			grunt.file.copy(dir + "/LICENSE", outdir + dir + "/LICENSE");
			try {
				grunt.file.copy(dir + "/.bowerrc", outdir + dir + "/.bowerrc");
			} catch (e) {}

			// Add README.md
			grunt.file.copy("./README.template", outdir + dir + "/README.md", {
				process: function (template) {
					return grunt.template.process(template, {
						data: {
							project: dir
						}
					});
				}
			});
		});

		// Copy specific css files
		grunt.file.copy("delite/themes/defaultapp.css", outdir + "delite/themes/defaultapp.css");

		var transitions = ["cover", "coverv", "fade", "flip", "revealv", "slidev"].map(function (trans) {
			return trans + ".css";
		});
		var path = "deliteful/ViewStack/transitions/";
		for (var i = 0; i < transitions.length; i++) {
			grunt.file.copy(path + transitions[i], outdir + path + transitions[i]);
		}

	});
};