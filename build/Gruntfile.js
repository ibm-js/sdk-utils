"use strict";

module.exports = function (grunt) {

	// A temporary directory used by amdserialize to output the processed modules.
	var tmpdir = "./tmp/";

	// The final output directory.
	var outdir = "./build/";

	// The grunt.config property populated by amdserialize, containing the
	// list of files to include in the layer.
	var outprop = "amdoutput";

	var decorPatterns = [
		// Include
		"decor/*.js",
		"requirejs-dplugins/has.js",
		"requirejs-dplugins/i18n.js",
		"requirejs-dplugins/css.js",
		// Exclude
		"!decor/Gruntfile.js"
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
			inlineText: true
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
				includeFiles: ["dpointer/events.js", "dpointer/handlers/*.js"]
			}, {
				name: "ecma402/layer",
				include: ["ecma402/IntlShim"],
				exclude: ["requirejs-dplugins/has", "requirejs-text/text"]
			}, {
				name: "delite/layer",
				include: grunt.file.expand(expandFiles, delitePatterns).map(trimExt)
					.concat(["delite/theme!delite/themes/{{theme}}/global.css"]),
				exclude: ["decor/layer", "dpointer/layer", "ecma402/layer"]
			}, {
				name: "deliteful/layer",
				include: grunt.file.expand(expandFiles, delitefulPatterns).map(trimExt),
				exclude: ["decor/layer", "dpointer/layer", "ecma402/layer", "delite/layer", "dstore/Memory", "dstore/Trackable"]
			}, {
				name: "dtreemap/layer",
				includeFiles: ["dtreemap/**/*.js"],
				excludeFiles: ["dtreemap/tests/**", "dtreemap/demos/**", "dtreemap/docs/**", "dtreemap/Gruntfile.js"]
			}, {
				name: "dcolor/layer",
				includeFiles: ["dcolor/*.js"],
				excludeFiles: ["dcolor/Gruntfile.js"]
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

		updateSamples: {
			liaison: {
				samples: {
					src: [
						"samples/*",
						"samples/css/*",
						"!samples/loan.html"
					]
				}
			},
			"liaison/delite": {
				samples: {
					src: [
						"../samples/delite/*",
						"!**/samples/delite/widgetskitchensink.html",
						"!**/loan.html"
					]/*,
					deps: ["delite", "liaison"]*/
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
			erase: [outdir],//.concat(libDirsBuild),
			finish: [tmpdir]
		}
	});

	// The main build task.
	grunt.registerTask("amdbuild", function (amdloader) {
		function useAmdDepsScan(name) {
			var layerToGetDeps = ["delite/layer", "decor/layer", "deliteful/layer", "ecma402/layer"];
			return layerToGetDeps.indexOf(name) >= 0;
		}

		// Create tasks list
		var tasksList = [];
		var name = this.name;
		var layers = grunt.config(name).layers;

		layers.forEach(function (layer) {
			if (useAmdDepsScan(layer.name)) {
				tasksList.push("amddepsscan:" + layer.name + ":" + name + ":" + amdloader);
			} else {
				tasksList.push("amddirscan:" + layer.name + ":" + name + ":" + amdloader);
			}
			tasksList.push("amdserialize:" + layer.name + ":" + name + ":" + outprop);
			tasksList.push("uglify");
			tasksList.push("correctSourceMap:" + layer.name + ":" + name + ":" + outdir);
			// Remove references to useless html template before copying plugins files.
			tasksList.push("filterPluginFiles:\\.(html|json)\\.js$:" + outprop);
			tasksList.push("copy:plugins");
		});

		tasksList.push("updateBowers:" + name + ":" + outdir);
		tasksList.push("addBoot:" + name + ":" + outdir);
		tasksList.push("copyMetaFiles:" + name + ":" + outdir);
		tasksList.push("updateSamples:" + name + ":" + outdir);
		tasksList.push("copyBuildResults:" + name + ":" + outdir);

		grunt.task.run(tasksList);

	});

	// Load the plugin that provides the "amd" task.
	grunt.loadNpmTasks("grunt-amd-build");
	grunt.loadTasks("./tasks/");

	// Load vendor plugins.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task.
	grunt.registerTask("default", ["clean:erase", "amdbuild:amdloader", "amdreportjson:amdbuild", "clean:finish"]);
};
