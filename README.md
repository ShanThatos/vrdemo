

So this is a VR project, it seems impossible to run through a non-vr device. 

Here are some steps for you to try and get it running on a pc: 
- npm install
- make run
- You should encounter an error, one of the dependencies we are using has a small bug that's really easy to fix. Open up node_modules\@tonejs\piano\build\midi\MidiInput.js and change line 11 to: 
    ```import { WebMidi } from 'webmidi';```
- restart the terminal
- make run
- Visit https://localhost:3000/vrdemo/ (Make sure it uses https)


All the non-hands demos will work on a regular pc -- but you need an oculus quest to run the hand demos. 
If you want to emulate a vr headset, check out this chrome extension: [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje?hl=en)

If you have a headset, open up the browser and visit https://shanthatos.github.io/vrdemo