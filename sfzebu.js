#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Command line arguments
// First argument is the directory you want to
// turn into a soundfont.
const sfPath = process.argv[2];

//only these files will be parsed
var acceptExt = [
	".wav", ".ogg", ".mp3", ".aiff", ".aif"
];

function getFileNamesInFolder(folderPath) {
	folderPath = path.resolve(folderPath); // Make it absolute.

	if (fs.lstatSync(folderPath).isDirectory()) {
		var filenames = fs.readdirSync(folderPath);

		return filenames;
	} else {
		throw Error(`${folderPath} is not a directory!`);
	}
}

function parseSFZ() {
	var sfz = "";
	var notes = [];
	
	//get conversion information
	for (var f in names) {
		var note = {
			letter : "n",
			octave : {},
			note : {},
			sample : {}
		}; 
		
		if (acceptExt.includes(path.extname(names[f]))) {
			notes.push(note);
			
			for (var c in names[f]) {
				if (isNaN(names[f][c])) { //if it is a letter
					note.sample = names[f];
					switch (names[f][c]) { //first two numbers are the note
						case "a": case "A": note.letter = "a"; note.note = "10"; break;
						//case "a#": case "A#": note = "11"; break;
						case "b": case "B": note.letter = "b"; note.note = "12"; break;
						case "c": case "C": note.letter = "c"; note.note = "01"; break;
						//case "c#": case "C#": note = "02"; break;
						case "d": case "D": note.letter = "d"; note.note = "03"; break;
						//case "d#": case "D#": note = "04"; break;
						case "e": case "E": note.letter = "e"; note.note = "05"; break;
						case "f": case "F": note.letter = "f"; note.note = "06"; break;
						//case "f#": case "F#": note = "07"; break;
						case "g": case "G": note.letter = "g"; note.note = "08"; break;
						//case "g#": case "G#": note = "09"; break;
						case "#": note.letter = note.letter + "#"; //make it sharp and adjust note number
							if (note.letter != "a#") {note.note = "0" + (parseInt(note.note) + 1).toString();}
							else {note.note = (parseInt(note.note) + 1).toString();}
						break;
						default: note.letter = "n";
					}
				} else { //if it is a number
					if (note.letter != "n") {
						var applied = false;
						
						switch (names[f][c]) { //last number is the octave
							case "0": note.octave = "0"; applied = true; break;
							case "1": note.octave = "1"; applied = true; break;
							case "2": note.octave = "2"; applied = true; break;
							case "3": note.octave = "3"; applied = true; break;
							case "4": note.octave = "4"; applied = true; break;
							case "5": note.octave = "5"; applied = true; break;
							case "6": note.octave = "6"; applied = true; break;
							case "7": note.octave = "7"; applied = true; break;
							//default: note.letter = "n";
						} if (applied == true) {break;}
					}
				} 
			}
		}
	}
	
	//sort samples by octave
	//notes = notes.sort(function(a,b){
		//return parseInt(a.octave) - parseInt(b.octave);
	//});
	
	//sort by note and octave
	notes = notes.sort(function(a,b){
		if (a.octave == b.octave) {
			return parseInt(a.note) - parseInt(b.note);
		} else {return parseInt(a.octave) - parseInt(b.octave);}
	});
	
	//build text file
	for (var i in notes) {
		var low = "";
		var high = "";
		
		sfz = sfz + "<region>\n";
		sfz = sfz + "sample=" + notes[i].sample + "\n";
		
		if (i == 0) {
			high = middleKey(notes[i], notes[parseInt(i) + 1], "up");
			sfz = sfz + "hikey=" + high + "\n";
		} else if (i == notes.length - 1) {
			low = middleKey(notes[i], notes[parseInt(i) - 1], "down");
			sfz = sfz + "lokey=" + low + "\n";
		} else {
			low = middleKey(notes[i], notes[parseInt(i) - 1], "down");
			high = middleKey(notes[i], notes[parseInt(i) + 1], "up");
			sfz = sfz + "lokey=" + low + "\n";
			sfz = sfz + "hikey=" + high + "\n";
		}
		
		sfz = sfz + "pitch_keycenter=" + notes[i].letter + notes[i].octave + "\n";
		sfz += "\n";
	} 
	
	return sfz;
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
function distCount(countFrom, countTo, l, e, dir) {
	var distance = 0;
	var count = countFrom;
	var nOct = l;
	
	while (count != countTo || nOct != e) {
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

//If parseSFZ was written, this would write the SFZ file.
writeFile(path.join(sfPath, folderName + ".sfz"), parseSFZ(names));