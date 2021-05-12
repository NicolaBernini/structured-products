FROM node
RUN apt-get install yarn
RUN npm install -g npm
RUN npm install --save-dev hardhat
RUN npm install --save-dev @nomiclabs/hardhat-waffle 'ethereum-waffle@^3.0.0' @nomiclabs/hardhat-ethers 'ethers@^5.0.0'
RUN yarn add --dev hardhat-log-remover
