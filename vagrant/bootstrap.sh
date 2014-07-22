#!/usr/bin/env bash

apt-get update
apt-get install -y git openjdk-7-jre-headless wget
cd /opt
git clone git://github.com/etsy/statsd.git
cd statsd/
#npm install git://github.com/markkimsal/statsd-elasticsearch-backend.git
#cd /tmp/
#wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.2.2.deb
 #dpkg -i elasticsearch-1.2.2.deb
#service elasticsearch start
#sh /opt/statsd/node_modules/statsd-elasticsearch-backend/es-index-template.sh
#/usr/share/elasticsearch/bin/plugin 
apt-get install mysql-server mysql-client
npm install mysql




