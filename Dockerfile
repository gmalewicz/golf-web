FROM httpd:2.4.61-alpine
LABEL maintainer="Grzegorz Malewicz"
ARG APP=./dist/golf-web/browser

COPY ${APP} /usr/local/apache2/htdocs/

COPY my-httpd.conf /usr/local/apache2/conf/httpd.conf

COPY httpd-ssl.conf /usr/local/apache2/conf/extra/httpd-ssl.conf

EXPOSE 80 443
