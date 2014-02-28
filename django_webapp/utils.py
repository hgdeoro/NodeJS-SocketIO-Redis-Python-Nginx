# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import uuid

import redis
import logging


redis_server = redis.StrictRedis(host='localhost', port=6379, db=0)

logger = logging.getLogger(__name__)


def send_message(user_id, message):
    logger.info("send_message() - user_id: '%s' - message: '%s'", user_id, message)
    url = "/app/user/{0}/notifications".format(user_id)
    redis_server.publish(url, message)


def store_uuid_cookie(user_id):
    """
    Generates an uuidCookie and store it in Radis.
    Returns: tuple with (uuidCookie, userId) (str, str) if stored correctly
    Returns: None if cookie couldn't be stored
    """
    uuid_cookie = str(uuid.uuid4())
    logger.info("store_uuid_cookie() - uuid_cookie: '%s' - user_id: '%s'", uuid_cookie, user_id)

    expire = 5  # 5 seconds
    set_result = redis_server.set("cookie-" + uuid_cookie,
                                  user_id,
                                  expire,
                                  nx=True)

    if set_result is True:
        return uuid_cookie
    else:
        logger.error("store_uuid_cookie() - redis_server.set() FAILED")
        return None
