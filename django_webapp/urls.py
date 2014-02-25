# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'django_webapp.views.home', name='home'),
    url(r'^python/$', 'django_webapp.views.home', name='get_uuid_cookie'),

    url(r'^admin/', include(admin.site.urls)),
)
