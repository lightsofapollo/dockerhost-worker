#! /bin/bash -vex

# template source which must override system files.
template_source=$1

# docker_worker_source that needs to be untar'ed
worker_source=$2

# install the system configuration
sudo tar xzf $template_source -C / --strip-components=1

# install the node app.
target=$HOME/dockerhost
mkdir -p $target
cd $target
tar xzf $worker_source -C $target --strip-components=1
sudo chown -R $USER:$USER $target
npm install --production
npm rebuild
