#!bin/sh

NODE_ENV=$1

if [ -z $NODE_ENV ]
then echo "请输入环境"
exit 1
fi

echo $NODE_ENV

pm2 startOrReload ecosystem.config.js --env $NODE_ENV --no-daemon
