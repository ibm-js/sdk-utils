module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("addBoot", function (buildCfg, outdir) {
		var layers = grunt.config(buildCfg).layers;

		layers.forEach(function (layer) {
			var bower = layer.bower;
			var layerNameBuild = layer.name.replace(/^([^\/]*)\//, "$1-build/");
			var path = outdir + layer.outputPath;

			// Get built deps
			var builtDeps = [];
			// if this is a sublayer, lets add the main layer to the dependency list:
			var match = layer.name.match(/^([^\/]*)\/[^\/]*\/layer$/);
			if (match) {
				builtDeps.push(match[1] + "-build");
			}

			for (var dep in bower.dependencies) {
				if (dep.match(/-build$/)) {
					builtDeps.push(dep);
				}
			}

			// Generate root module.
			var boot = "\nrequire.config(" +
				JSON.stringify({
					packages: [layerNameBuild.replace(/\/layer$/, "")].concat(builtDeps).map(function (dep) {
						return {
							name: dep.replace(/-build/, ""),
							location: dep
						};
					})
				}, null, "\t") +
				");\n";
			boot += "define(\"" + layerNameBuild + "\", " +
				JSON.stringify(builtDeps.map(function (dep) {
					return dep + "/layer";
				})) + ", function(){});";

			grunt.file.write(path, grunt.file.read(path) + boot);
		});
	});
};