var pos = require('pos');
var fs = require('fs');
var readline = require('readline');
var _ = require('underscore');
var data = {};
var conversation = [];

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
		updateConversation(input);
		var output = generateMessage();
		respond(output + '\n');
	});
}

function updateConversation(input){

	var words = new pos.Lexer().lex(input);
	var taggedWords = new pos.Tagger().tag(words);
	
	var pattern = [];
	for (var i = 0; i < taggedWords.length; i++) {
	    var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];
	    pattern.push(tag);
	}

	pattern = pattern.join('|');
	
	// add message to conversation
    conversation.push({
    	"text": input,
    	"pattern": pattern
    });
}

function generateMessage() {

	var output = [];
	var message = conversation[conversation.length - 1];

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