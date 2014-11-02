#!/bin/bash -ex

# This script generates the keys used to "secure" the server we make a minimum
# amount of effort to protect the server but this is probably not the right
# passphrase generation mechanism.

if [ -z $1 ];
then
  echo "You must pass a hostname"
  exit 1
fi

if [ ! -d "$2" ];
then
  echo "You must pass a directory to run operations in"
  exit 1
fi

host=$1
uuid=$(python -c 'import uuid; print(str(uuid.uuid4()))')

# Enter the working directory to create stuff
cd $2

# Taken mostly from https://docs.docker.com/articles/https/

# First, initialize the CA serial file and generate CA private and public keys:

echo 01 > ca.srl
openssl genrsa -passout pass:$uuid  -des3 -out ca-key.pem 2048
openssl req -passin pass:$uuid \
            -passout pass:$uuid \
            -new -x509 -days 365 \
            -subj "/C=US/ST=CA/L=Santa Clara/O=Mozilla/OU=Mozilla/CN=$host/emailAddress=jlal@mozilla.com" \
            -key ca-key.pem -out ca.pem


# Now that we have a CA, you can create a server key.

openssl genrsa \
  -passout pass:$uuid \
  -des3 -out server-key.pem 2048

# Now that we have the CA, we can create the CSR.

openssl req \
  -passin pass:$uuid \
  -subj "/CN=$host" -new -key server-key.pem -out server.csr

# Next, we're going to sign the key with our CA:

openssl x509 \
  -passin pass:$uuid \
  -req -days 365 -in server.csr -CA ca.pem -CAkey ca-key.pem \
  -out server-cert.pem

# For client authentication, create a client key and certificate signing request

openssl genrsa -passout pass:$uuid -des3 -out key.pem 2048
openssl req -passin pass:$uuid \
  -subj '/CN=client' -new -key key.pem -out client.csr

# To make the key suitable for client authentication, create an extensions config file:

echo extendedKeyUsage = clientAuth > extfile.cnf

# Sign the keys

openssl x509 \
  -passin pass:$uuid \
  -req -days 365 -in client.csr -CA ca.pem -CAkey ca-key.pem \
  -out cert.pem -extfile extfile.cnf

# Finally, you need to remove the passphrase from the client and server key:

openssl rsa -passin pass:$uuid -in server-key.pem -out server-key.pem
