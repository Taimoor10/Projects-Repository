## Steps for Installation and Configuration:

1. Node and Expo-CLI installation
   -  Run **setup** binary file provided in the project folder to install both `node v14.6.0` and `expo-cli v3.22.3`

   - See [docs](https://nodejs.org/en/download/package-manager/#macos) for node installation details
   - See [docs](https://docs.expo.io/workflow/expo-cli/) for expo-cli installation details

2. Expo client Installation
   - Go to App store on your iOS device and install **Expo Client** application
   
   - See [docs](https://apps.apple.com/us/app/expo-client/id982107779) for more details about application
   
   **The Expo client application makes it possible to build and run application quickly on mobile device.Application cannot be started without expo client application**
  
  
## Steps:

1. Before Running the project. Replace the IP address provided in file "baseURL.json" in project folder with the IP address of 
      your own mac machine to allow application to send requests to the Node server. Keep the port number same. Save the file after
      modification.
   
   => Command: Type `ipconfig getifaddr en0` in terminal on mac machine to get IP address
               or
               Alernatively Go to "System Preferences -> Network" on mac machine to view IP address


   => Reason: The iOS does not allow port reversing, so the IP address of the machine has to be explicitly provided.
      Providing "localhost" as an IP address wont work.

   => baseURL.json file structure:
      {
         "baseUrl": "172.21.5.27:3000",    -> Replace 172.21.5.27 with the IP address of your machine. keep the port 3000
         "verifierUrl": "172.21.5.27:3001" -> Replace 172.21.5.27 with the IP address of your machine. keep the port 3001
      }

   /*Important: The structure in "baseURL.json" file allow application to send and receive information from the server. Do not 
                provide "localhost:3000" or "localhost:3001" as an IP address. provide IP address explicitly as "172.XX.X.XX:3000"
                and "172.XX.X.XX:3001". Save the file before running the project.


2. Run Expo:

   => Run binary file named "run" provided in project folder to launch expo. This will start a terminal. Keep the terminal running
   or
   Alternatively type the following command in terminal from project's root directory to launch expo. Keep the terminal running

    => Command: `expo start -c`

   Note: Expo Development Tool portal be will opened in browser on "http://localhost:19003/"

   See docs "https://docs.expo.io/workflow/how-expo-works/" for more details


3. The previous step will open Expo development tool in browser window. Select "Tunnel" from provided connections and Scan the
      QR code with camera of your iOS device. A prompt will appear on the device with message "Open in Expo". Tap on the option 
      to proceed. A javascript bundle will start building and application will be launched on device

    /*Important: Keep the device active during this step

    /*Important: Make sure, that the selected connection is Tunnel connection before scanning the QR code. On selecting a Tunnel
    connection a message "Tunnel ready" will be shown in the interpreter. If the message is not shown, stop the expo terminal and  
    perform step 2 again

    /*Possible Errors: Sometimes, the bundle gets corrupted during the bilding phase. This could result in error messages like
      "Could not connect to development server". Simply select "ReloadJS" as the option will be suggested on the bottom of mobile 
      device


4. Read another file named "applicationInstructions.txt" provided in the project folder for information about the application
      usage
