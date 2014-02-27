# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import json

from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http.response import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from django_webapp.utils import store_uuid_cookie, send_message
import redis
from redis.exceptions import ConnectionError
import logging
from django.template.context import RequestContext


redis_server = redis.StrictRedis(host='localhost', port=6379, db=0)

logger = logging.getLogger(__name__)


class JsonResponse(HttpResponse):
    def __init__(self, data, indent=None, *args, **kwargs):
        content = json.dumps(data, indent=indent)
        mimetype = kwargs.get('mimetype', 'application/json')
        super(JsonResponse, self).__init__(content=content, content_type=mimetype,
            *args, **kwargs)


def home(request):
    return render_to_response('home.html',
                              context_instance=RequestContext(request))


def notifications(request):
    if request.user.is_anonymous():
        logger.info("User isn't authenticated. Redirecting to home.")
        messages.error(request, "You must authenticate to enter this area.")
        return HttpResponseRedirect(reverse('home'))
    else:
        logger.info("User is authenticated: %s", request.user)
        return render_to_response('notifications.html',
                                  context_instance=RequestContext(request))


def uuid_cookie(request):
    try:
        uuid_cookie, user_id = store_uuid_cookie()
    except ConnectionError:
        return JsonResponse({"ok" : False,
                             "uuidCookie": None,
                             "userId": None,
                             "message": "Connection to Redis failed." })

    if uuid_cookie:
        return JsonResponse({"ok" : True,
                             "userId": user_id,
                             "uuidCookie": uuid_cookie })
    else:
        return JsonResponse({"ok" : False,
                             "userId": None,
                             "uuidCookie": None })


# FIXME: remove "@csrf_exempt"
@csrf_exempt
def post_message(request):
    message = request.POST['message-text']
    user_id = request.POST['user-id']
    send_message(user_id, message)
    return JsonResponse({"ok" : True})
