### builder ###
FROM node:6.12.0 as builder

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN git rev-parse --short HEAD > VERSION

### production ###
FROM nginx:1.14-alpine
COPY --from=builder /usr/src/app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]