var https = require("https");
var prompt = require("prompt");
var q = require("promised-io/promise");
var fs = require("fs");

var password;
var username;

function setPassword() {
	var deferred = new q.Deferred();

	var option = {
		properties: {
			username: {
				description: "Enter your Github username",
			},
			password: {
				description: "Enter your Github password",
				hidden: true
			}
		}
	}

	prompt.start();
	prompt.get(option, function(err, result){
		password = result.password;
		username = result.username;
		deferred.resolve();
	})

	return deferred.promise;
}


function getOptions(path) {
	var options = {
		hostname: "api.github.com",
		path: path,
		headers: {
			"user-agent": "nodejs",
			"accept": "application/vnd.github.v3.raw+json"
		}
	};
	if (username && password) {
		options.auth = username + ":" + password
	}
	return options;
};

function get(path) {
	var deferred = new q.Deferred();

	https.get(getOptions(path), function(res) {
		var statusCode = res.statusCode;
		if (statusCode === 404) {
			deferred.resolve();
		} else if (statusCode === 200){
			var data = "";
			res.on("data", function(chunk) {
				data += chunk.toString();
			});

			res.on("end", function() {
				deferred.resolve(data);
			});
		} else {
			deferred.reject(statusCode);
		}
	}).on('error', function(e) {
		deferred.reject(e);
	});

	return deferred.promise;
}

function getBowers(repos) {
	repos = JSON.parse(repos).map(function(repo) {
		return repo.name;
	}).sort();
	console.log(repos)
	console.log(repos.length)
	var promises = [];
	repos.forEach(function (repo) {
		promises.push(get("/repos/ibm-js/" + repo + "/contents/bower.json"))
	});

	return q.all(promises)
}

function parseBowers(bowers) {
	function writeDeps(ref, deps) {
		var out = "";
		if (deps.length) {
			out = " | Requires " + ref + " version\n" +
					  ":-------- | :-----:\n";
			deps.forEach(function (dep){
				out += dep[0] + " | " + dep[1] + "\n";
			});
		} else {
			out = "No package depends on " + ref + ".\n";
		}

		return out;
	}

	var store = {};
	bowers.forEach(function (bower){
		if (bower) {
			bower = JSON.parse(bower);

			store[bower.name] = store[bower.name] || [];
			store[bower.name].version = bower.version;

			deps = bower.dependencies || {};
			Object.keys(deps).forEach(function (dep) {
				store[dep] = store[dep] || [];
				store[dep].push([bower.name, deps[dep]]);
			})
		}
	});

	var out = "# List of dependencies\n\n";
	var intern = "## Internal dependencies\n\n";
	var extern = "## External dependencies\n\n";
	Object.keys(store).sort().forEach(function (dep){
		var common = writeDeps(dep, store[dep]) +
			"\n-------------------\n\n";

		if (store[dep].version) {
			intern += "### " + dep + " - " + store[dep].version + "\n";
			intern += common;
		} else {
			extern += "### " + dep + "\n";
			extern += common;
		}
	});
	out = out + intern + extern;

	fs.writeFile("./dependencyList.md", out, function (){
		console.log("dependencyList.md file written successfully.");
	});
}

setPassword().then(function(){
		return get("/orgs/ibm-js/repos?per_page=100");
	}).then(getBowers, function(e) {
		console.log("Got error: " + (e.message || e));
	}).then(parseBowers);
