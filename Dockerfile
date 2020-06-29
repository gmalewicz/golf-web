FROM httpd:2.4.43-alpine
LABEL maintainer="Grzegorz Malewicz"
ARG APP=./dist/golf-web/*
ARG CONF=./my-httpd.conf

COPY ${APP} /usr/local/apache2/htdocs/

COPY my-httpd.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 80
