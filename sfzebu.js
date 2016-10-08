#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

//command line arguments
//first argument is the directory you want to
//turn into a soundfont.
const sfPath = process.argv[2];

//only these files will be parsed
var acceptExt = [
	".wav", ".ogg", ".mp3", ".aiff", ".aif", ".flac"
];

var noteExp = /(?:\\-|\b)[a-g]#?[0-7]/ig;
var velExp = /(vel[^-]+)[\d]/ig;

function getFileNamesInFolder(folderPath) {
	folderPath = path.resolve(folderPath); //make it absolute.

	if (fs.lstatSync(folderPath).isDirectory()) {
		var filenames = fs.readdirSync(folderPath);

		return filenames;
	} else {throw Error(`${folderPath} is not a directory!`);}
}

function setNote(noteLetter) {
	switch (noteLetter) {
		case "a": return "10";
		case "a#": return "11";
		case "b": return "12";
		case "c": return "01";
		case "c#": return "02";
		case "d": return "03";
		case "d#": return "04";
		case "e": return "05";
		case "f": return "06";
		case "f#": return "07";
		case "g": return "08";
		case "g#": return "09";
	}
}

function parseSFZ() {
	var sfz = "";
	var notes = [];
	var velocityEnabled = false;
	
	//get conversion information
	for (var f in names) {
		var note = {
			letter : "n",
			octave : {},
			note : {},
			velocity : null,
			sample : {}
		}; 
		
		if (acceptExt.includes(path.extname(names[f]))) {
			notes.push(note); //push instance
			note.sample = names[f]; //store the filename
			
			var noteNames = names[f].toLowerCase().match(noteExp);
			var velNums = names[f].match(velExp);
			
			if (velNums != null) { //store velocity
				note.velocity = velNums[0].replace(/\D/g,''); //isolate the velocity integers
				
				if (parseInt(note.velocity) > 127) { //test with a 0 in front
					console.log("File " + names[f] + " -vel is greater than 127.");
					process.exit(1);
				} else {velocityEnabled = true;}
			} else if (velocityEnabled) {
				console.log("Check", names[f], "for missing velocity markings.");
				process.exit(1);
			}
			
			if (noteNames == null) { //debug if dashes aren't used properly
				console.log("Check", names[f], "for improper formatting.");
				process.exit(1);
			} else {
				if (noteNames.length > 1) { //too many instances resembling note names
					console.log("Check", names[f], "for instances resembling note names.");
					
					for (var i in noteNames) {
						console.log("Detected Sequence " + (parseInt(i) + 1) + " is " + noteNames[i]);
					} process.exit(1);
				} else { //store note name
					if (noteNames[0].length > 2) { //note is sharp
						note.letter = noteNames[0][0] + noteNames[0][1];
						note.octave = noteNames[0][2];
						note.note = setNote(noteNames[0][0] + noteNames[0][1]);
					} else {
						note.letter = noteNames[0][0];
						note.octave = noteNames[0][1];
						note.note = setNote(noteNames[0][0]);	
					}
				}
			}
		}
	}
	
	notes = notes.sort(function(a,b) {
		if (a.octave == b.octave) {
			if (a.note == b.note) { return parseInt(a.velocity) - parseInt(b.velocity); } //by velocity
			else { return parseInt(a.note) - parseInt(b.note); } //by note
		} else { return parseInt(a.octave) - parseInt(b.octave); } //by octave 
	});
	
	//console.log(notes);
	
	//build text file
	for (var i in notes) {
		var down = null;
		var up = null;
		var low = "";
		var high = "";
		var vel = "";
		
		sfz = sfz + "<region>\n";
		sfz = sfz + "sample=" + notes[i].sample + "\n";
		
		down = findNextNote(notes[i], notes, "down");
		up = findNextNote(notes[i], notes, "up");
		
		if (down != null) {low = middleKey( notes[i], down, "down"); }
		if (up != null) {high = middleKey( notes[i], up, "up"); }
		if (low != "") {sfz = sfz + "lokey=" + low + "\n";}
		if (high != "") {sfz = sfz + "hikey=" + high + "\n";}
		
		if (notes[i].velocity != null) {
			if (i > 0) {
				if (notes[i-1].letter == notes[i].letter && notes[i-1].octave == notes[i].octave) {
					vel = setVelocity(notes[i-1].velocity, "high");
					sfz = sfz + "lovel=" + vel + "\n";
				} 
			}
			
			sfz = sfz + "hivel=" + notes[i].velocity + "\n";
		}
		
		sfz = sfz + "pitch_keycenter=" + notes[i].letter + notes[i].octave + "\n";
		sfz += "\n";
	} 
	
	return sfz;
}

function setVelocity(vel) {
	vel = parseInt(vel);
	vel = vel + 1;
	return vel.toString();
}

function findNextNote(self, friends, dir) {
	var foundSelf = false;
	
	if (dir == "up") {
		for (var f = 0; f < friends.length; f++) {
			if (foundSelf) {
				if (self.letter != friends[f].letter) {return friends[f];} 
				else if (self.octave != friends[f].octave) {return friends[f];} 
			} else if (friends[f] == self) {foundSelf = true;}	
		}
	} else { 
		for (var g = friends.length - 1; g > -1; g--) {
			if (foundSelf) {
				if (self.letter != friends[g].letter) {return friends[g];} 
				else if (self.octave != friends[g].octave) {return friends[g];} 	
			} else if (friends[g] == self) {foundSelf = true;}	
		}
	}
}

//find note between samples
function middleKey(self, friend, dir) {
	var newKey = "";
	var noteCount = [];
	
	var myNote = parseInt(self.note);
	var myOctave = parseInt(self.octave)
	var frNote = parseInt(friend.note);
	var frOctave = parseInt(friend.octave)
	
	var distance = distCount(myNote, frNote, myOctave, frOctave, dir);
	
	var distLow = Math.floor(distance/2);
	var distHigh = distance - distLow - 1;
	
	if (dir == "down") {noteCount = keyCount(myNote, distLow, myOctave, "down");} 
	else {noteCount = keyCount(myNote, distHigh, myOctave, "up");}
	
	newKey = nameNote(self, friend, noteCount[0], noteCount[1]);
	
	return newKey;
}

//name note...obvs
function nameNote(me, them, num, oct) {
	var numString = ""
	
	switch (num) {
		case 1: numString = "c"; break;
		case 2: numString = "c#"; break;
		case 3: numString = "d"; break;
		case 4: numString = "d#"; break;
		case 5: numString = "e"; break;
		case 6: numString = "f"; break;
		case 7: numString = "f#"; break;
		case 8: numString = "g"; break;
		case 9: numString = "g#"; break;
		case 10: numString = "a"; break;
		case 11: numString = "a#"; break;
		case 12: numString = "b"; break;
	} 
	
	if (numString == them.letter && oct == them.octave) {
		numString = me.letter + me.octave;
	} else {numString = numString + oct.toString();}
	
	return numString;
}

//find note
function keyCount(countFrom, countAmount, octave, dir) {
	var count = 0;
	var newOctave = octave;
	var newKey = countFrom;
	var both = [];

	while(count < countAmount) {
		if (dir == "up") {newKey++;}
		if (dir == "down") {newKey--;}
		
		if (newKey > 12) {newOctave++; newKey = 1;}
		if (newKey < 1) {newOctave--; newKey = 12;}
		count++;
	}
	
	both.push(newKey);
	both.push(newOctave);
	
	return both;
}

//find distance
function distCount(countFrom, countTo, sOct, fOct, dir) {
	var distance = 0;
	var count = countFrom;
	var nOct = sOct;
	
	while (count != countTo || nOct != fOct) {
		if (dir == "up") {
			distance++;
			count++;	
		}
		
		if (dir == "down") {
			distance++;
			count--;
		}
		
		if (count > 12) {nOct++; count = 1;}
		if (count < 1) {nOct--; count = 12;}
	}
	
	return distance;
}

function writeFile(filePath, contents) {
	filePath = path.resolve(filePath);
	fs.writeFileSync(filePath, contents);
}

var names = getFileNamesInFolder(sfPath);
var folderName = path.basename(sfPath);

//write sfz to text file
writeFile(path.join(sfPath, folderName + ".sfz"), parseSFZ(names));