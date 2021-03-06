#! /bin/bash -vex
lsb_release -a

# add docker group and add current user to it
sudo groupadd docker
sudo usermod -a -G docker $USER

[ -e /usr/lib/apt/methods/https ] || {
  apt-get update
  apt-get install apt-transport-https
}

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
sudo sh -c "echo deb https://get.docker.io/ubuntu docker main\
> /etc/apt/sources.list.d/docker.list"

## Update to pick up new registries
sudo apt-get update -y

## Install all the packages
sudo apt-get install -y curl build-essential lxc-docker lvm2 linux-image-extra-`uname -r` jq
