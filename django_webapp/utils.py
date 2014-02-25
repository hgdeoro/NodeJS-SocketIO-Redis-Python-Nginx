# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import redis


redis_server = redis.StrictRedis(host='localhost', port=6379, db=0)


def send_message(user_id, message):
    url = "/app/user/{0}/notifications".format(user_id)
    redis_server.publish(url, message)


def store_uuid_cookie():
    """
    Generates an uuidCookie and store it in Radis.
    Returns: uuid (string) if stored correctly
    Returns: None if cookie couldn't be stored
    """
    uuid_cookie = str(uuid.uuid4())

    expire = 5  # 5 seconds
    set_result = redis_server.set("cookie-" + uuid_cookie,
                                  USER_ID,
                                  expire,
                                  nx=True)

    if set_result is True:
        return uuid_cookie
    else:
        return None
