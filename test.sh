#!/bin/bash

echo "Waiting..."
./wait-for localhost:3306 -t 2

if [ $? = 0 ]
then
  echo "OK"
else
  echo "NOT OK ${$?}"
fi
