module.exports = function (grunt) {

	"use strict";

	grunt.registerTask("addBoot", function (buildCfg, outdir) {
		var layers = grunt.config(buildCfg).layers;

		layers.forEach(function (layer) {
			var bower = layer.bower;
			var path = outdir + layer.outputPath;

			// Get deps that will be built in the same run
			var builtDeps = [];
			var deps = [];

			// if this is a sublayer, add the main layer to the dependency list:
			var match = layer.name.match(/^([^\/]*)\/[^\/]*\/layer$/);
			if (match) {
				deps.push(match[1]);
				builtDeps.push(match[1] + "-build");
			}

			// Extract the dependencies from bower.json
			for (var dep in bower.dependencies) {
				match = dep.match(/^(.*)-build$/);
				if (match) {
					builtDeps.push(dep);
					deps.push(match[1]);
				}
			}

			// Decorate the layer config with packages that needs a configuration (ie the current layer and its dependencies)
			layer.configs = [layer.name.replace(/\/layer$/, "")].concat(deps);

			// Generate boot code.
			// Start with the configuration
			var boot = "\nvar paths = {};";
			layer.configs.forEach(function (dep) {
				boot += "\n!require.s.contexts._.config.paths[\"" + dep + "\"] && " +
					"(paths[\"" + dep + "\"] = \"" + dep + "-build\");"
			});
			boot += "\nrequire.config({" +
				"\n\tpaths: paths" +
				"\n});\n";

			// Create the module that will load the dependencies
			var layerNameBuild = layer.name.replace(/^([^\/]*)\//, "$1-build/");
			boot += "define(\"" + layerNameBuild + "\", " +
				JSON.stringify(deps.map(function (dep) {
					return dep + "-build/layer";
				})) + ", function(){});\n";

			grunt.file.write(path, grunt.file.read(path) + boot);
		});
		// Save the decorated layers
		grunt.config([buildCfg, "layers"], layers);

	});
};