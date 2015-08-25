# voting_poll_app
Polling app with node.js express.js angular.js

Practice app from freecodecamp.com 

Instructions to set up with gernerators @
http://www.freecodecamp.com/challenges/waypoint-get-set-for-basejumps

In Cloud9.io workspace, 
Never run this command on your local machine. But in your Cloud 9 terminal window, run: 
rm -rf * && echo "export NODE_PATH=$NODE_PATH:/home/ubuntu/.nvm/v0.10.35/lib/node_modules" >> ~/.bashrc && source ~/.bashrc && npm install -g yo grunt grunt-cli generator-angular-fullstack && yo angular-fullstack

Do if npm and node is outdated: npm install -g npm

bower install && npm install

To start MongoDB, run the following commands in your terminal: mkdir data && echo 'mongod --bind_ip=$IP --dbpath=data --nojournal --rest "$@"' > mongod && chmod a+x mongod && ./mongod

grunt serve


Files of interest: /server/apps.js /server/routes.js /server/api/polls/* /client/app/main/*
