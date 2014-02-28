# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import uuid

import redis
import logging

from django.conf import settings

redis_server = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB)

logger = logging.getLogger(__name__)


def send_message(user_id, message):
    """
    Sends a message to a user
    """
    logger.info("send_message() - user_id: '%s' - message: '%s'", user_id, message)
    url = "/app/user/{0}/notifications".format(user_id)
    redis_server.publish(url, message)


def store_uuid_cookie(user_id):
    """
    Generates an uuidCookie and store it in Radis.
    Returns: uuidCookie if stored correctly
    Returns: None if cookie couldn't be stored
    """
    uuid_cookie = str(uuid.uuid4())
    logger.info("store_uuid_cookie() - uuid_cookie: '%s' - user_id: '%s'", uuid_cookie, user_id)

    set_result = redis_server.set(settings.UUIDCOOKIE_PREFIX + uuid_cookie,
                                  user_id,
                                  settings.UUIDCOOKIE_EXPIRE_TIME,
                                  nx=True)

    if set_result is True:
        return uuid_cookie
    else:
        logger.error("store_uuid_cookie() - redis_server.set() FAILED")
        return None
