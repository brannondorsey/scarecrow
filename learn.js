var pos = require('pos');
var fs = require('fs');
var _ = require('underscore');

var brain;
var corpus;

fs.readFile( __dirname + '/data/corpuses/brannon_dorsey/corpus.json', 'utf-8', function(err, data){
	
	if (err) throw err;
	corpus = JSON.parse(data);

	fs.readFile( __dirname + '/data/brain_template.json', 'utf-8', function(err, data){

		if (err) throw err;
		brain = JSON.parse(data);

		var messageCounter = 0;
		_.each(corpus, function(conversation){
			_.each(conversation.messages, function(message){
				updateData(message.normalized.text);
				messageCounter++;
				console.log(messageCounter);
			});
		});

		fs.writeFile( __dirname	+ '/data/brain.json', JSON.stringify(brain), function(err){
			if (err) throw err;
			console.log('Learned ' + _.size(brain.posPatterns) + ' patterns from ' + messageCounter + ' messages!');
		});
	});
});

function updateData(input){

	var words = new pos.Lexer().lex(input);
	var taggedWords = new pos.Tagger().tag(words);
	
	var pattern = [];
	for (var i = 0; i < taggedWords.length; i++) {
	    var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];
	    // add word to brain.taggedWords
	    if (_.has(brain.taggedWords, tag)){
	    	brain.taggedWords[tag].push(word);
	    }

	    pattern.push(tag);
	}

	pattern = pattern.join('|');

	// add new pattern to last message's pattern array
    if (brain.messages.length > 0) {
	    var lastMessage = brain.messages[brain.messages.length - 1];
		if (!_.has(brain.posPatterns, lastMessage.pattern)) {
			brain.posPatterns[lastMessage.pattern] = [];
		}
		brain.posPatterns[lastMessage.pattern].push(pattern);
	}
	
	// add message to brain.messages
    brain.messages.push({
    	"text": input,
    	"pattern": pattern
    });
}