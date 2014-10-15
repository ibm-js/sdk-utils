module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("addBoot", function (buildCfg, outdir) {
		var layers = grunt.config(buildCfg).layers;

		layers.forEach(function (layer) {
			var bower = layer.bower;
			var path = outdir + layer.outputPath;

			// Get built deps
			var builtDeps = [];
			for (var dep in bower.dependencies) {
				if (dep.match(/-build$/)) {
					builtDeps.push(dep);
				}
			}

			// Generate root module.
			var boot = "\nrequire.config(" +
				JSON.stringify({
					packages: [bower.name].concat(builtDeps).map(function (dep) {
						return {
							name: dep.replace(/-build$/, ""),
							location: dep
						};
					})
				}, null, "\t") +
				");\n";
			boot += "define(\"" + bower.name + "/layer\", " +
				JSON.stringify(builtDeps.map(function (dep) {
					return dep + "/layer";
				})) + ", function(){});";

			grunt.file.write(path, grunt.file.read(path) + boot);
		});
	});
};