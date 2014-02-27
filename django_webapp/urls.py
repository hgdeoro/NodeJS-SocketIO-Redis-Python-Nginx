# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'django_webapp.views.home', name='home'),
    url(r'^python/uuidCookie/$', 'django_webapp.views.uuid_cookie', name='uuid_cookie'),
    url(r'^python/notifications/$', 'django_webapp.views.notifications', name='notifications'),
    url(r'^python/postMessage/$', 'django_webapp.views.post_message', name='post_message'),

    url(r'^admin/', include(admin.site.urls)),
)
