"use strict";

module.exports = function (grunt) {

	// A temporary directory used by amdserialize to output the processed modules.
	var tmpdir = "./tmp/";

	// The final output directory.
	var outdir = "./build/";

	// The grunt.config property populated by amdserialize, containing the
	// list of files to include in the layer.
	var outprop = "amdoutput";
	
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
			}]
		},

		// Here goes the config for the amd plugins build process.
		amdplugins: {
			"requirejs-text/text": {
				inlineText: true
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
			},
			others: {
				src: ["delite/LICENSE", "delite/.bowerrc", "deliteful/LICENSE", "deliteful/.bowerrc"],
				dest: outdir
			},
			delitefulSamples: {
				src: ["deliteful/samples/**"],
				dest: outdir,
				options: {
					noProcess: "**/*.png",
					process: function (content, path) {
						var scriptRE = /(<script[^>]*>[\s\S]*?<\/script>[\s\S]*?<script[^>]*>[\s\S]*?)(\s*?<\/script>[\s\S]*?<script[^>]*>\s*?)([\s\S]*?\S)(\s*?<\/script>)/;
						return content.replace(scriptRE, function(match, p1, p2, p3, p4, offset, string){
							return p1 + "\n"+
								"\t\trequirejs.config({\n" +
								"\t\t\tpackages:[\n" +
								"\t\t\t\t{name: 'delite', location: 'delite-build'},\n" +
								"\t\t\t\t{name: 'deliteful', location: 'deliteful-build'}\n" + 
								"\t\t\t]\n" +
								"\t\t});" +
								p2 + "\n" +
								'\trequire(["delite/layer", "deliteful/layer"], function(){' + p3 + "\n\t});" + p4;
						});
					}
				}
			},
			
			deliteBuild: {
				expand: true,
				cwd: outdir + "delite",
				src: "**/*",
				dest: "delite-build/",
				dot: true
			},
			
			delitefulBuild: {
				expand: true,
				cwd: outdir + "deliteful",
				src: "**/*",
				dest: "deliteful-build/",
				dot: true
			}
		},

		// Erase temp directory and previous build
		clean: {
			erase: [outdir, "delite-build", "deliteful-build"],
			finish: [tmpdir]
		}
	});

	grunt.registerTask("correctSourceMap", function (layerName) {
		var path = outdir + layerName + ".map";
		var content = grunt.file.read(path);
		content = content.replace(/\.\.(\/|\\\\)tmp(\/|\\\\)/g, "");
		grunt.file.write(path, content);
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
				case "deliteful/layer":
					grunt.task.run("amddirscan:" + layer.name + ":" + name + ":" + amdloader);
					break;				
				}
			grunt.task.run("amdplugins:" + layer.name + ":" + name + ":" + amdloader);
			grunt.task.run("amdserialize:" + layer.name + ":" + name + ":" + outprop);
			grunt.task.run("uglify");
			grunt.task.run("correctSourceMap:" + layer.name);
			grunt.task.run("copy:plugins");
		});
	});


	// Load the plugin that provides the "amd" task.
	grunt.loadNpmTasks("grunt-amd-build");

	// Load vendor plugins.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task.
	grunt.registerTask("default", ["clean:erase", "amdbuild:amdloader", "amdreportjson:amdbuild", "copy:others", "copy:delitefulSamples", "copy:deliteBuild","copy:delitefulBuild", "clean:finish"]);
};
