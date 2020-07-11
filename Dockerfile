FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY /Docker/default.conf /etc/nginx/conf.d