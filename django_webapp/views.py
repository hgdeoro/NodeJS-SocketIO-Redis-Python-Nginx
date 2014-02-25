# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import json

from django.http.response import HttpResponse
from django.shortcuts import render_to_response
from django_webapp.utils import store_uuid_cookie
import redis
from redis.exceptions import ConnectionError


redis_server = redis.StrictRedis(host='localhost', port=6379, db=0)


class JsonResponse(HttpResponse):
    def __init__(self, data, indent=None, *args, **kwargs):
        content = json.dumps(data, indent=indent)
        mimetype = kwargs.get('mimetype', 'application/json')
        super(JsonResponse, self).__init__(content=content, content_type=mimetype,
            *args, **kwargs)


def home(request):
    return render_to_response('home.html')


def get_uuid_cookie(request):
    try:
        uuid_cookie = store_uuid_cookie()
    except ConnectionError:
        return JsonResponse({"ok" : False,
                             "uuidCookie": None,
                             "message": "Connection to Redis failed." })

    if uuid_cookie:
        return JsonResponse({"ok" : True,
                             "uuidCookie": uuid_cookie })
    else:
        return JsonResponse({"ok" : False,
                             "uuidCookie": None })
