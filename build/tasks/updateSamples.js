module.exports = function (grunt) {

	"use strict";

	// Update samples
	function buildSamples(content, dir) {
		var scriptRE = /(<script[^>]*>)(\s*require\s*\(\s*\[[\s\S]*?)(<\/script>)/ig;
		return content.replace(scriptRE, function (match, openTag, content, closeTag) {
			return openTag + "\n" +
				"\trequire([\"" + dir + "/layer\"], function(){" + content + "\n\t});\n\t" + closeTag;
		});
	}

	grunt.registerTask("updateSamples", function (buildCfg, outdir) {
		var name =this.name;

		var buildConfig = grunt.config(buildCfg);
		var layers = buildConfig.layers;

		// Get processed packages
		var builtLibs = layers.map(function (layer) {
			return layer.name.match(/^(.*)\/[^\/]*$/)[1];
		});

		// Update bower.json
		builtLibs.forEach(function (lib, index) {
			var config = grunt.config([name, lib, "samples"]);
			var samples = grunt.file.expand({
				dot: true,
				filter: "isFile",
				cwd: lib
			}, (config && config.src) || "samples/**/*");


			samples.forEach(function (path) {
				var orig = lib + "/" + path;
				var dest = outdir + lib + "/" + path;

				grunt.file.copy(orig, dest, {
					noProcess: ["**/*.png", "**/*.js", "**/*.less", "**/*.css"],
					process: function (content) {
						return buildSamples(content, lib + "-build");
					}
				});
			});
		});
	});
};