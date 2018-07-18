#Drone Management System
A drone management system is useful for tracking drone location and activeness of drone.
It is help you know how many drones are active and how many drones are inactive so that you properly manage your drone records and provide service to your drones.

A system watch your drones activeness if your drone not moveing for than 10 seconds so system highlight drone using droneId. DroneId is basically a unique number which is assign to every drone.


# How to run
- Extract the zip file:
- cd drone-management-system

Run project using Docker:
- docker build -t drone-management
- docker images
- docker run -p 8000:8000 -d drone-management


Run project using localhost:
- npm install
- node server.js
- open browser and run : localhost:8000


I am Run project using ngrok:
- ./ngrok http 8000
- Replace ngrok https url at application.js file line 4 for running your application as    central server. 
- open browser and run : ngrok https url


# Requirements
- Mac OS X, Linux, Windows;
- It's tested to run with node v8.11.1 or latest;

