"use strict";

module.exports = function (grunt) {

	// A temporary directory used by amdserialize to output the processed modules.
	var tmpdir = "./tmp/";

	// The final output directory.
	var outdir = "./build/";

	// The grunt.config property populated by amdserialize, containing the
	// list of files to include in the layer.
	var outprop = "amdoutput";
	
	var libDirs = ["delite", "deliteful", "dpointer", "dtreemap", "liaison"];
	var libDirsBuild = libDirs.map(function(dir) {
		return dir + "-build";
	});
	
	var delitePatterns = [
		// Include
		"delite/**/*.js", 
		// Exclude
		"!delite/dijit/**", 
		"!delite/docs/**",
		"!delite/form/**",
		"!delite/Gruntfile.js",
		"!delite/layout/**",
		"!delite/mobile/**",
		"!delite/nls/**",
		"!delite/samples/**", 
		"!delite/tests/**", 
		"!delite/themes/tasks/**", 
		"!delite/**/holodark/**", 
		"!delite/**/ios/**"
	];
		
	grunt.initConfig({
	// The loader config should go here.
		amdloader: {
			baseUrl: "./",
			packages: [
			]
		},

		amdbuild: {
			// dir is the output directory.
			dir: tmpdir,

			// List of plugins that the build should not try to resolve at build time.
			runtimePlugins: ["delite/theme", "delite/css", "dojo/has"],

			// List of layers to build.
			layers: [{
				name: "delite/layer",
				include: grunt.file.expand({filter: "isFile"}, delitePatterns).map(function (path) {return path.slice(0,-3);})
			},{
				name: "deliteful/layer",
				includeFiles: ["deliteful/**/*.js"],
				excludeFiles: ["deliteful/tests/**", "deliteful/samples/**", "deliteful/docs/**", "deliteful/**/holodark/**", "deliteful/**/ios/**", "deliteful/Gruntfile.js"]
			},{
				name: "dpointer/layer",
				includeFiles: ["dpointer/**/*.js"]
			},{
				name: "dtreemap/layer",
				includeFiles: ["dtreemap/**/*.js"],
				excludeFiles: ["dtreemap/tests/**", "dtreemap/demos/**", "dtreemap/docs/**"]
			},{
				name: "liaison/layer",
				includeFiles: ["liaison/**/*.js"],
				excludeFiles: ["liaison/delite/**", "liaison/polymer/**", "liaison/tests/**", "liaison/samples/**", "liaison/docs/**", "liaison/node_modules/**", "liaison/Gruntfile.js"]
			},{
				name: "liaison/delite/layer",
				includeFiles: ["liaison/delite/**/*.js"],
				excludeFiles: ["liaison/delite/widgets/StarRating.js"]
			}]
		},

		// Here goes the config for the amd plugins build process.
		amdplugins: {
			"requirejs-text/text": {
				inlineText: true
			}
		},

		buildLib: {
			liaison: {
				samples: {
					src: ["./samples/**/*", "!./samples/**/loan.html", "!./samples/delite/widgetskitchensink.html", "!./samples/delite-polymer/**/*", "!./samples/polymer/**/*"],
					"./samples/delite/**/*": {
						sublayers: ["liaison/delite"],
						packages: [
							{name: "liaison", location: "liaison-build"}
						]
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
		
		function test (path) {
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
			switch (layer.name) {
				case "delite/layer":
					grunt.task.run("amddepsscan:" + layer.name + ":" + name + ":" + amdloader);
					break;
				default:
					grunt.task.run("amddirscan:" + layer.name + ":" + name + ":" + amdloader);
					break;				
				}
			grunt.task.run("amdplugins:" + layer.name + ":" + name + ":" + amdloader);
			grunt.task.run("amdserialize:" + layer.name + ":" + name + ":" + outprop);
			grunt.task.run("uglify");
			grunt.task.run("correctSourceMap:" + layer.name);
			// Remove references to useless html template before copying plugins files.
			grunt.task.run("filterPluginFiles:\\.html\\.js$");
			grunt.task.run("copy:plugins");
		});
		
		libDirs.forEach(function (dir){
			grunt.task.run("buildLib:"+ dir);
		});
	});
	
	// Update samples
	function buildSamples (content, path, buildDeps, packages) {
		var scriptRE = /(<script[^>]*>)(\s*require\s*\(\s*\[[\s\S]*?)(<\/script>)/ig,
			config = "\trequire.config(" +
				JSON.stringify({
					packages: packages || buildDeps.map(function (lib) {
						return {name: lib, location: lib + "-build"};
					})
				}, null, "\t").split("\n").map(function (line, i) {
					return (i > 0 ? "\t" : "") + line;
				}).join("\n") +
				");\n";

		var count = 0;
		return content.replace(scriptRE, function(match, openTag, content, closeTag){
			return openTag + "\n" +
				// If it is the first require of the file include config.
				(count++ === 0 ? config : "") +
				"\trequire(" +
				JSON.stringify(buildDeps.map(function (lib) {
					return lib + "/layer";
				}), null, "\t").split("\n").map(function (line, i) {
					return (i > 0 ? "\t" : "") + line;
				}).join("\n") +
				", function(){" + content + "\n\t});\n\t" + closeTag;
		});
	}
	
	grunt.registerTask("buildLib", function(dirName) {
		var ibmDeps = [dirName];
		
		// Update Bower.json
		var bower = grunt.file.readJSON(dirName + "/bower.json");
		bower.name += "-build";
		
		var deps = bower.dependencies;
		for (var dep in deps) {
			if (libDirs.indexOf(dep) !== -1) {
				deps[dep + "-build"] = deps[dep];
				delete deps[dep];
				ibmDeps.push(dep);
			}
		}
		
		bower.devDependencies = {};
		bower.devDependencies[dirName] = bower.version;
		
		grunt.file.write(outdir + dirName + "/bower.json", JSON.stringify(bower, null, 2));
		
		// Copy files
		grunt.file.copy(dirName + "/LICENSE", dirName + "-build/LICENSE");
		try {
			grunt.file.copy(dirName + "/.bowerrc", dirName + "-build/.bowerrc");
		} catch (e) {
		}
		
		// Add README.md
		grunt.file.copy("./README.template", dirName + "-build/README.md", {
			process: function (template) {
				return grunt.template.process(template, {data: {project: dirName}});
			}
		});
			
		// Copy and modify samples.
		var pathModule = require("path"),
			config = grunt.config([this.name, dirName, "samples"]),
			samples = grunt.file.expand({filter: "isFile", cwd: dirName}, (config || {}).src || "samples/**/*"),
			fileConfig = {};

		if (config) {
			Object.keys(config).forEach(function (pattern) {
				if (pattern !== "excludes") {
					grunt.file.expand({filter: "isFile", cwd: dirName}, pattern).forEach(function (path) {
						fileConfig[pathModule.normalize(path)] = config[pattern];
					});
				}
			});
		}

		samples.forEach(function(path){
			var orig = dirName + "/" + path;
			var dest = dirName + "-build/" + path;
			var sublayersDeps = (fileConfig[pathModule.normalize(path)] || {}).sublayers || [];
			var packages = (fileConfig[pathModule.normalize(path)] || {}).packages;
			grunt.file.copy(orig, dest, {
				noProcess: ["**/*.png", "**/*.js", "**/*.less"],
				process: function (content, path) {
					return buildSamples(content, path, ibmDeps.concat(sublayersDeps), packages);
				}
			});
		})
		
		// Copy to final destination
		var files = grunt.file.expand({filter: "isFile", cwd: outdir + dirName},  "**/*");
		files.forEach(function(path){
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
