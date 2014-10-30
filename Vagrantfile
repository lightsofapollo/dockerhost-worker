Vagrant.configure("2") do |config|
  config.vm.box = "phusion/ubuntu-14.04-amd64"

  # We need to configure docker to expose port 60366
  config.vm.provision "shell", path: 'deploy/packer/scripts/node.sh'
  config.vm.provision "docker", images: []

  # The host port seems to be the default for docker.. The guest is
  # random in the ephemeral range.
  config.vm.network :private_network, ip: "192.168.50.11"
  config.vm.synced_folder ENV['HOME'], ENV['HOME']
end
