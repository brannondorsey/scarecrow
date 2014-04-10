var pos = require('pos');
var fs = require('fs');
var readline = require('readline');
var _ = require('underscore');
var data = {};

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

fs.readFile( __dirname + '/data/brain.json', 'utf-8', function(err, d){
	if (err) throw err;
	data = JSON.parse(d);
	
	respond('hi!\n');
	// all of the things happen up there^
});

function respond(response) {
	rl.question(response, function(input){

		// process and respond...
		updateData(input);
		var output = generateMessage();
		respond(output + '\n');
	});
}

function updateData(input){

	var words = new pos.Lexer().lex(input);
	var taggedWords = new pos.Tagger().tag(words);
	
	var pattern = [];
	for (var i = 0; i < taggedWords.length; i++) {
	    var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];

	    // add word to data.taggedWords
	    if (_.has(data.taggedWords, tag)){
	    	data.taggedWords[tag].push(word);
	    }

	    pattern.push(tag);
	}

	pattern = pattern.join('|');

	// add new pattern to last message's pattern array
    if (data.messages.length > 0) {
	    var lastMessage = data.messages[data.messages.length - 1];
		if (!_.has(data.posPatterns, lastMessage.pattern)) {
			data.posPatterns[lastMessage.pattern] = [];
		}
		data.posPatterns[lastMessage.pattern].push(pattern);
	}
	
	// add message to data.messages
    data.messages.push({
    	"text": input,
    	"pattern": pattern
    });

}

function generateMessage() {

	var output = [];
	var message = data.messages[data.messages.length - 1];

	// make the return the *most likely* pattern
	if (_.size(data.posPatterns) > 0 &&
		!_.isUndefined(data.posPatterns[message.pattern])) {
		var targetPattern = _.sample(data.posPatterns[message.pattern]);
		targetPattern = targetPattern.split('|');
		
		for (var i = 0; i < targetPattern.length; i++) {
			var wordPos = targetPattern[i];
			if (!_.isEmpty(data.taggedWords[wordPos])) {
				output.push(_.sample(data.taggedWords[wordPos]));
			}
		}
	}

	return output.join(' ');
}