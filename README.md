
# VR Demo 
___

### Project Members
Shanth Koka, Bennett Liu

### Project Structure
The project is written in typescript and compiled to an HTML+JS bundle with vite. The core code is in src/ and the entrypoint is Main.ts. Our demo is split up into separate scenes that can be found in src/scenes/. Check out the scenes to get a sense of how the entity component system works. 

### Instructions
So this is a VR project, it may seem impossible to run through a non-vr device. Here are some steps for you to try and get it running on a pc: 
- npm install
- make run
- You should encounter an error, one of the dependencies we are using has a small bug that's really easy to fix. Open up node_modules\@tonejs\piano\build\midi\MidiInput.js and change line 11 to: 
    ```import { WebMidi } from 'webmidi';```
- restart the terminal
- make run
- Visit https://localhost:3000/vrdemo/ (Make sure it uses https)


All the non-hands demos will work on a regular pc -- but you need an oculus quest to run the hand demos. 
If you want to emulate a vr headset, check out this chrome extension: [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje?hl=en)

If you have an oculus quest headset, open up the browser and visit chrome://flags to enable webxr hand tracking. Then visit https://shanthatos.github.io/vrdemo


### Demo Videos:
- [Colored Lights Demo](https://youtu.be/YE8loNGMinc)
- [Hand Tracking Demo](https://youtu.be/HP4NSQZV_FA)
- [Handsy Hands Demo](https://youtu.be/fEodmbYcrYc)
- [Piano Demo](https://youtu.be/Fx9BF3J9ffk)


<!-- Zip command: zip -r vrdemo.zip lib src .eslintrc.json index.html makefile package.json package-lock.json Presentation.pdf README.md Report.pdf tsconfig.json vite.config.js -->