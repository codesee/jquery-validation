/*jshint node:true*/
module.exports = function(grunt) {

"use strict";

var banner,
	umdStart,
	umdMiddle,
	umdEnd,
	umdStandardDefine,
	umdAdditionalDefine,
	umdLocalizationDefine;

banner = "/*!\n" +
	" * jQuery Validation Plugin v<%= pkg.version %>\n" +
	" *\n" +
	" * <%= pkg.homepage  %>\n" +
	" *\n" +
	" * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
	" * Released under the <%= _.pluck(pkg.licenses, 'type').join(', ') %> license\n" +
	" */\n";

// define UMD wrapper variables

umdStart = "(function( factory ) {\n" +
	"\tif ( typeof define === \"function\" && define.amd ) {\n";

umdMiddle = "\t} else {\n" +
	"\t\tfactory( jQuery );\n" +
	"\t}\n" +
	"}(function( $ ) {\n\n";

umdEnd = "\n}));";

umdStandardDefine = "\t\tdefine( [\"jquery\"], factory );\n";
umdAdditionalDefine = "\t\tdefine( [\"jquery\", \"./jquery.validate\"], factory );\n";
umdLocalizationDefine = "\t\tdefine( [\"jquery\", \"../jquery.validate\"], factory );\n";

grunt.initConfig({
	pkg: grunt.file.readJSON("package.json"),
	concat: {
		// used to copy to dist folder
		dist: {
			options: {
				banner: banner +
					umdStart +
					umdStandardDefine +
					umdMiddle,
				footer: umdEnd
			},
			files: {
				"dist/jquery.validate.js": ["src/core.js", "src/*.js"]
			}
		},
		extra: {
			options: {
				banner: banner +
					umdStart +
					umdAdditionalDefine +
					umdMiddle,
				footer: umdEnd
			},
			files: {
				"dist/additional-methods.js": ["src/additional/additional.js", "src/additional/*.js"]
			}
		}
	},
	uglify: {
		options: {
			preserveComments: false,
			banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
				"<%= grunt.template.today('m/d/yyyy') %>\n" +
				" * <%= pkg.homepage  %>\n" +
				" * Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
				" Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n"
		},
		dist: {
			files: {
				"dist/additional-methods.min.js": ["dist/additional-methods.js"],
				"dist/jquery.validate.min.js": ["dist/jquery.validate.js"]
			}
		},
		all: {
			files: [{
				expand: true,
				cwd: "dist/localization",
				src: "**/*.js",
				dest: "dist/localization",
				ext: ".min.js"
			}]
		}
	},
	compress: {
		dist: {
			options: {
				mode: "zip",
				level: 1,
				archive: "dist/<%= pkg.name %>-<%= pkg.version %>.zip",
				pretty: true
			},
			src: [
				"dist/**/*.js",
				"README.md",
				"changelog.txt",
				"Gruntfile.js",
				"package.json",
				"demo/**/*.*",
				"lib/**/*.*",
				"src/**/*.*",
				"test/**/*.*"
			]
		}
	},
	qunit: {
		files: ["test/index.html"]
	},
	jshint: {
		options: {
			jshintrc: true
		},
		files: [
			"src/**/*.js"
		],
		test: {
			files: {
				src: [
					"test/*.js"
				]
			}
		},
		grunt: {
			files: {
				src: [
					"Gruntfile.js"
				]
			}
		}
	},
	watch: {
		gruntfile: {
			files: "Gruntfile.js",
			tasks: ["jshint:grunt"]
		},
		src: {
			files: "<%= jshint.files %>",
			tasks: ["concat", "qunit"]
		},
		test: {
			files: ["<%= jshint.test.files.src %>", "test/index.html"],
			tasks: ["jshint:test"]
		}
	},
	jscs: {
		all: {
			options: {
				preset: "jquery"
			},
			src: "src/**/*.*"
		}
	},
	copy: {
		dist: {
			options: {
				// append UMD wrapper
				process: function ( content ) {
					return umdStart + umdLocalizationDefine + umdMiddle + content + umdEnd;
				}
			},
			files: [{
				src: ["src/localization/*"],
				dest: "dist/localization",
				expand: true,
				flatten: true,
				filter: "isFile"
			}]
		}
	},
	replace: {
		dist: {
			src: ["dist/**/*.min.js"],
			overwrite: true,
			replacements: [{
				from: "./jquery.validate",
				to: "./jquery.validate.min"
			}]
		}
	}
});

grunt.loadNpmTasks("grunt-contrib-jshint");
grunt.loadNpmTasks("grunt-contrib-qunit");
grunt.loadNpmTasks("grunt-contrib-uglify");
grunt.loadNpmTasks("grunt-contrib-concat");
grunt.loadNpmTasks("grunt-contrib-compress");
grunt.loadNpmTasks("grunt-contrib-watch");
grunt.loadNpmTasks("grunt-jscs-checker");
grunt.loadNpmTasks("grunt-contrib-copy");
grunt.loadNpmTasks("grunt-text-replace");

grunt.registerTask("default", ["concat", "copy", "jscs", "jshint", "qunit"]);
grunt.registerTask("release", ["default", "uglify", "replace", "compress"]);
grunt.registerTask("start", ["concat", "watch"]);

};
