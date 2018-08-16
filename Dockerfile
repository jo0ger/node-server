FROM node:9.3.0

LABEL author="Jooger <iamjooger@gmail.com>"

RUN yarn global add pm2

COPY . /www/app/node-server/

WORKDIR /www/app/node-server

RUN yarn

ENV HOST 0.0.0.0
ENV PORT 3001
ENV NODE_ENV docker

RUN ["chmod", "+x", "/www/app/node-server/docker-start.sh"]
CMD /bin/bash /www/app/node-server/docker-start.sh $NODE_ENV

EXPOSE 3001
