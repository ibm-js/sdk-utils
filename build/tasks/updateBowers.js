module.exports = function (grunt) {

	"use strict";

	var includedDeps = {
		"decor": ["dcl", "requirejs-dplugins"]
	};
	//Add deps from decor to simplify code
	includedDeps.delite = includedDeps.decor.concat(["dojo", "requirejs-domready", "requirejs-text"]);
	includedDeps.deliteful = includedDeps.delite.concat([]);

	grunt.registerTask("updateBowers", function (buildCfg, outdir) {
		var buildConfig = grunt.config(buildCfg);
		var layers = buildConfig.layers;

		// Get processed packages
		var builtLibs = layers.map(function (layer) {
			return layer.name.match(/^(.*)\/[^\/]*$/)[1];
		});

		// Update bower.json
		builtLibs.forEach(function (lib, index) {
			// Read bower.json
			var bower;
			try {
				bower = grunt.file.readJSON(lib + "/bower.json");
			} catch (e) {
				return;
			}

			// Update package name
			bower.name += "-build";

			for (var dep in bower.dependencies) {
				if (includedDeps[lib] && includedDeps[lib].indexOf(dep) !== -1) {
					// This dependency is already in the layer.
					delete bower.dependencies[dep];

				} else if (builtLibs.indexOf(dep) >= 0) {
					// Remove all the packages included in that layer.
					if (includedDeps[dep]) {
						includedDeps[dep].forEach(function (includedDep) {
							delete bower.dependencies[includedDep];
						});
					}

					// Convert the dependency to build form.
					bower.dependencies[dep + "-build"] = bower.dependencies[dep];
					delete bower.dependencies[dep];
				}
			}

			bower.devDependencies = {};
			bower.devDependencies[lib] = bower.version;

			layers[index].bower = bower;
			grunt.config(buildCfg, buildConfig);
			grunt.file.write(outdir + lib + "/bower.json", JSON.stringify(bower, null, 2));
		});
	});
};