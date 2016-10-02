# SFZebu
## Automated SFZ Creator for Zampler in NodeJS

### What it is
I specifically made this for processing large multisample libraries to make a quick and dirty SFZ file for Zampler. It can't handle batch processing so you'll have to put each folder in one at a time. I might add this if there's enough interest or I find myself with over 100 folders to process for some reason. xD
	
### What it can't do
Velocity regions and anything not explicitly mentioned on the Zampler website. I do have plans to add velocity regions in the future but I might switch to a different language as I'm not extremely fond of Javascript. It will also ignore subfolders so make sure all your samples are in the folder you give it. It also ignores everything that isn't a sound file so don't worry about invisible files messing it up.
	
### What it can do
Parses the filenames in a folder and outputs a formatted SFZ with the folder's name.
	
### How it works
It looks for specific information in the filenames so make sure you name them accordingly. Note names and octaves must be in the filename and in a specific way. For example, "strum-c4.wav" will work. "strum-c-5.wav" will not. It also stretches the lowest and highest notes across the rest of the keyboard, meaning that if c2 is the lowest note, it will trigger that sample for every note below c2 as well. It keeps the center though, so c2 won't sound weird directly on it's root note.
	
### How to use it
Download NodeJS and run it through the command line as such:

* Write node in the command line
* Drag and drop sfzebu.js
* Drag and drop folder with the samples inside

Command line example: `node path/to/sfzebu.js "path/to/sample folder"`