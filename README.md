# Fileserver
A simple fileserver that allows uploading and downloading files with unique filenames without any authentication and saves the 
file's metadata in a MongoDB collection.

## Requirements:  
- MongoDB server. 
- Directory with write access. 
- Suitable amount of free disk space.

## Setup

1.) $ cp .env.example .env (fill the configuration).  
2.) $ yarn install.  
3.) $ yarn start:dev (runs the service via nodemon).  
4.) $ yarn build (transpiles TS into JS).  
5.) $ yarn start:prod (transpiles TS into JS and runs the service). 
