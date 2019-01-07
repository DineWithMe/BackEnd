FROM node:8.12

WORKDIR /usr/app

COPY . .

RUN npm i
# why we reinstall bcrypt again https://stackoverflow.com/questions/15809611/bcrypt-invalid-elf-header-when-running-node-app
# no longer need to reinstall bcrypt again as switch to pure js bcrypt
CMD ["/bin/bash"]
# bring up bash shell https://www.ctl.io/developers/blog/post/dockerfile-entrypoint-vs-cmd/