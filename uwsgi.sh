#!/bin/bash

BASEDIR=$(cd $(dirname $0); pwd)

UWSGI_PORT=3031 # NOT http port

uwsgi --chdir=$BASEDIR \
    --module=django_webapp.wsgi:application \
    --env DJANGO_SETTINGS_MODULE=django_webapp.settings \
    --master --pidfile=/tmp/nodejs-websockets-django_webapp.pid \
    --socket=127.0.0.1:$UWSGI_PORT \
    --processes=5 \
    --harakiri=20 \
    --max-requests=5000 \
    --vacuum \
    --home=${BASEDIR}/virtualenv
