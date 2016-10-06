# SFZebu
## Automated SFZ Creator in NodeJS

### What it is
I specifically made this for processing large multisample libraries to make a quick SFZ file for Zampler. They might work in other sfz players but I haven't tested them in anything but Zampler.
	
### What it can't do
loop_start, loop_end, and anything not explicitly mentioned on the Zampler website. It will ignore subfolders so make sure all your samples are in the folder you give it. It also ignores everything that isn't a sound file so don't worry about invisible files messing it up.
	
### What it can do
Parses the filenames in a folder and outputs a formatted SFZ with the folder's name.
	
### How it works
It looks for specific information in the filenames so make sure you name them accordingly. Note names and octaves must be in the filename and in a specific way. 

Filename example: `strum-c4-vel127`

Adjacent notes meet in the middle for hikey and lokey. If there isn't an even number then the highest note will be pitched down by 1 extra semitone. SFZebu also assumes that the velocity mentioned in the filename is the highest you want that file to play. 
	
### How to use it
Download NodeJS and run it through the command line as such:

* Write node in the command line
* Drag and drop sfzebu.js
* Drag and drop folder with the samples inside

Command line example: `node path/to/sfzebu.js "path/to/sample folder"`