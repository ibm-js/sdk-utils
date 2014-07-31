"use strict";

module.exports = function (grunt) {

	// A temporary directory used by amdserialize to output the processed modules.
	var tmpdir = "./tmp/";

	// The final output directory.
	var outdir = "./build/";

	// The grunt.config property populated by amdserialize, containing the
	// list of files to include in the layer.
	var outprop = "amdoutput";

	var libDirs = ["decor", "delite", "deliteful", "dpointer", "dtreemap", "dcolor", "ecma402", "liaison"];
	var libDirsBuild = libDirs.map(function (dir) {
		return dir + "-build";
	});

	var decorPatterns = [
		// Include
		"decor/*.js",
		"requirejs-dplugins/has.js",
		"requirejs-dplugins/i18n.js",
		// Exclude
		"!decor/Gruntfile.js",
		"!decor/keys.js"
	];

	var delitePatterns = [
		// Include
		"delite/**/*.js",
		"dojo/dom-geometry.js", // For dtreemap
		"requirejs-text/text.js",
		// Exclude
		"!delite/Gruntfile.js",
		"!delite/node_modules/**",
		"!delite/nls/**",
		"!delite/samples/**",
		"!delite/tests/**",
		"!delite/TooltipDialog.js",
		"!delite/Tooltip.js",
		"!delite/Overlay.js",
		"!delite/Opener.js",
		"!delite/DialogLevelManager.js",
		"!delite/DialogBase.js",
		"!delite/Dialog.js"
	];

	var delitefulPatterns = [
		// Include
		"deliteful/**/*.js",
		// Exclude
		"!deliteful/tests/**",
		"!deliteful/samples/**",
		"!deliteful/docs/**",
		"!deliteful/**/holodark/**",
		"!deliteful/**/ios/**",
		"!deliteful/Gruntfile.js"
	];

	var expandFiles = {
		filter: "isFile"
	};

	function trimExt(path) {
		return path.slice(0, -3);
	}

	grunt.initConfig({
		// The loader config should go here.
		amdloader: {
			baseUrl: "./",

			// Enable build of requirejs-text/text
			inlineText: true,
			config: {
				"ecma402/locales": /^(zh-Han(s|t)|en|es|fr|it|pt|ja|de)$/
			}

		},

		amdbuild: {
			buildPlugin: true,

			// dir is the output directory.
			dir: tmpdir,

			// List of layers to build.
			layers: [{
				name: "decor/layer",
				include: grunt.file.expand(expandFiles, decorPatterns).map(trimExt)
			}, {
				name: "dpointer/layer",
				includeFiles: ["dpointer/**/*.js"]
			}, {
				name: "ecma402/layer",
				include: ["ecma402/IntlShim"],
				exclude: ["requirejs-dplugins/has", "requirejs-text/text"]
			}, {
				name: "delite/layer",
				include: grunt.file.expand(expandFiles, delitePatterns).map(trimExt).concat(["delite/theme!delite/themes/{{theme}}/global.css"]),
				exclude: ["decor/layer", "dpointer/layer", "ecma402/layer"]
			}, {
				name: "deliteful/layer",
				include: grunt.file.expand(expandFiles, delitefulPatterns).map(trimExt),
				exclude: ["decor/layer", "dpointer/layer", "ecma402/layer", "delite/layer", "dstore/Memory", "dstore/Observable"]
			}, {
				name: "dtreemap/layer",
				includeFiles: ["dtreemap/**/*.js"],
				excludeFiles: ["dtreemap/tests/**", "dtreemap/demos/**", "dtreemap/docs/**", "dtreemap/Gruntfile.js"]
			}, {
				name: "dcolor/layer",
				includeFiles: ["dcolor/*.js"]
			}, {
				name: "liaison/layer",
				includeFiles: ["liaison/**/*.js"],
				excludeFiles: ["liaison/delite/**", "liaison/polymer/**", "liaison/tests/**", "liaison/samples/**", "liaison/docs/**", "liaison/node_modules/**", "liaison/Gruntfile.js"]
			}, {
				name: "liaison/delite/layer",
				includeFiles: ["liaison/delite/**/*.js"],
				excludeFiles: ["liaison/delite/widgets/StarRating.js"]
			}]
		},

		buildLib: {
			liaison: {
				samples: {
					src: [
						"samples/**/*",
						"!samples/**/loan.html",
						"!samples/delite/widgetskitchensink.html",
						"!samples/delite-polymer/**/*",
						"!samples/polymer/**/*"
					],
					"samples/delite/**/*": {
						deps: ["liaison/delite", "delite", "liaison"]
					}
				}
			}
		},

		// Config to allow uglify to generate the layer.
		uglify: {
			options: {
				banner: "<%= " + outprop + ".header%>",
				sourceMap: true
			},
			dist: {
				src: "<%= " + outprop + ".modules.abs %>",
				dest: outdir + "<%= " + outprop + ".layerPath %>"
			}
		},

		// Copy the plugin files to the real output directory.
		copy: {
			plugins: {
				expand: true,
				cwd: tmpdir,
				src: "<%= " + outprop + ".plugins.rel %>",
				dest: outdir,
				dot: true
			}
		},

		// Erase temp directory and previous build
		clean: {
			erase: [outdir].concat(libDirsBuild),
			finish: [tmpdir]
		}
	});

	grunt.registerTask("correctSourceMap", function (layerName) {
		var path = outdir + layerName + ".map";
		var content = grunt.file.read(path);
		content = content.replace(/\.\.(\/|\\\\)tmp(\/|\\\\)/g, "");
		grunt.file.write(path, content);
	});

	grunt.registerTask("filterPluginFiles", function (stringRE) {
		var rel = grunt.config(outprop + ".plugins.rel");
		var abs = grunt.config(outprop + ".plugins.abs");

		function test(path) {
			return !path.match(new RegExp(stringRE));
		}

		grunt.config(outprop + ".plugins.rel", rel.filter(test));
		grunt.config(outprop + ".plugins.abs", abs.filter(test));
	});

	// The main build task.
	grunt.registerTask("amdbuild", function (amdloader) {
		var name = this.name,
			layers = grunt.config(name).layers;

		layers.forEach(function (layer) {
			if (layer.name === "delite/layer" ||
				layer.name === "decor/layer" ||
				layer.name === "deliteful/layer" ||
				layer.name === "ecma402/layer") {
				grunt.task.run("amddepsscan:" + layer.name + ":" + name + ":" + amdloader);
			} else {
				grunt.task.run("amddirscan:" + layer.name + ":" + name + ":" + amdloader);
			}
			grunt.task.run("amdserialize:" + layer.name + ":" + name + ":" + amdloader + ":" + outprop);
			grunt.task.run("uglify");
			grunt.task.run("correctSourceMap:" + layer.name);
			// Remove references to useless html template before copying plugins files.
			grunt.task.run("filterPluginFiles:\\.html\\.js$");
			grunt.task.run("copy:plugins");
		});

		libDirs.forEach(function (dir) {
			grunt.task.run("buildLib:" + dir);
		});
	});

	// Generate root file.
	function getBoot(buildDeps) {
		var packages = [];
		buildDeps.forEach(function (dep){
			dep = dep.split("/")[0];
			packages.indexOf(dep) === -1 && packages.push(dep);
		});
		var result = "require.config(" +
			JSON.stringify({
				packages: packages.map(function (lib) {
					return {
						name: lib,
						location: lib + "-build"
					};
				})
			}, null, "\t") +
			");\n";

		result += "define(" +
			JSON.stringify(buildDeps.map(function (lib, i) {
				return lib + (i === 0 ? "/layer" : "/boot");
			})) + ", function(){});";

		return result;
	}

	function getBootModule(deps, ext) {
		return deps[0].replace(/^([^\/]*)(.*)$/, "$1-build$2/boot" + (ext || ""));
	}

	// Update samples
	function buildSamples(content, buildDeps) {
		var scriptRE = /(<script[^>]*>)(\s*require\s*\(\s*\[[\s\S]*?)(<\/script>)/ig;
		return content.replace(scriptRE, function (match, openTag, content, closeTag) {
			var bootModule = getBootModule(buildDeps);
			return openTag + "\n" +
				"\trequire([\"" + bootModule + "\"], function(){" + content + "\n\t});\n\t" + closeTag;
		});
	}

	grunt.registerTask("buildLib", function (dirName) {
		var ibmDeps = [dirName];

		function updateBowerJson(projName, dirName, ibmDeps) {
			// Update Bower.json
			var bower;
			try {
				bower = grunt.file.readJSON(dirName + "/bower.json");
			} catch (e) {
				return;
			}
			bower.name += "-build";

			if (dirName === "decor") {
				bower.dependencies = {};
			} else {
				var deps = bower.dependencies || {};
				var removeDeps = deps.decor ? ["dcl", "requirejs-dplugins"] : [];
				removeDeps = removeDeps.concat(deps.delite ? ["requirejs-domready", "requirejs-text", "dojo"] : []);
				for (var dep in deps) {
					if (libDirs.indexOf(dep) !== -1) {
						deps[dep + "-build"] = deps[dep];
						delete deps[dep];
						ibmDeps.push(dep);
					}
					if (removeDeps.indexOf(dep) !== -1 && deps[dep]) {
						delete deps[dep];
					}
				}
			}

			bower.devDependencies = {};
			bower.devDependencies[projName] = bower.version;

			grunt.file.write(outdir + dirName + "/bower.json", JSON.stringify(bower, null, 2));
		}

		updateBowerJson(dirName, dirName, ibmDeps);

		// Copy files
		grunt.file.copy(dirName + "/LICENSE", dirName + "-build/LICENSE");
		try {
			grunt.file.copy(dirName + "/.bowerrc", dirName + "-build/.bowerrc");
		} catch (e) {}

		// Add README.md
		grunt.file.copy("./README.template", dirName + "-build/README.md", {
			process: function (template) {
				return grunt.template.process(template, {
					data: {
						project: dirName
					}
				});
			}
		});

		// Copy and modify samples.
		var pathModule = require("path"),
			config = grunt.config([this.name, dirName, "samples"]),
			samples = grunt.file.expand({
				filter: "isFile",
				cwd: dirName
			}, (config || {}).src || "samples/**/*"),
			fileConfig = {};

		if (config) {
			Object.keys(config).forEach(function (pattern) {
				if (pattern !== "excludes") {
					grunt.file.expand({
						filter: "isFile",
						cwd: dirName
					}, pattern).forEach(function (path) {
						fileConfig[pathModule.normalize(path)] = config[pattern];
					});
				}
			});
		}

		var bootDirs = [ibmDeps];
		var sampleDirNames = {};

		samples.forEach(function (path) {
			var orig = dirName + "/" + path;
			var dest = dirName + "-build/" + path;
			var deps = (fileConfig[pathModule.normalize(path)] || {}).deps || ibmDeps;

			if (dirName !== deps[0]) {
				// Add boot file.
				bootDirs.push(deps);
			}

			sampleDirNames[pathModule.dirname(path)] = 1;

			grunt.file.copy(orig, dest, {
				noProcess: ["**/*.png", "**/*.js", "**/*.less"],
				process: function (content) {
					return buildSamples(content, deps);
				}
			});
		});

		bootDirs.forEach(function (deps){
			// Create boot files.
			grunt.file.write(getBootModule(deps, ".js"), getBoot(deps));
		});

		bootDirs.forEach(function (deps) {
			updateBowerJson(dirName, deps[0], []);
		});

		Object.keys(sampleDirNames).forEach(function (sampleDirName) {
			updateBowerJson(dirName, pathModule.join(dirName, sampleDirName), []);
		});

		// Copy to final destination
		var files = grunt.file.expand({
			filter: "isFile",
			cwd: outdir + dirName
		}, "**/*");
		files.forEach(function (path) {
			var orig = outdir + dirName + "/" + path;
			var dest = dirName + "-build/" + path;
			grunt.file.copy(orig, dest);
		});
	});


	// Load the plugin that provides the "amd" task.
	grunt.loadNpmTasks("grunt-amd-build");

	// Load vendor plugins.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task.
	grunt.registerTask("default", ["clean:erase", "amdbuild:amdloader", "amdreportjson:amdbuild", "clean:finish"]);
};
