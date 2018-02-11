FROM node:latest

LABEL author="Jooger <iamjooger@gmail.com>"

RUN npm install pm2 -g

ADD . /www/app/node-server/

WORKDIR /www/app/node-server

RUN npm i

ENV HOST 0.0.0.0
ENV PORT 3001
ENV NODE_ENV production

RUN ["chmod", "+x", "/www/app/node-server/docker-start.sh"]
CMD /bin/bash /www/app/node-server/docker-start.sh $NODE_ENV

EXPOSE 3001
