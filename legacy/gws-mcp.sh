#!/bin/bash
docker run --rm -i \
  -v "/Users/k-kawahara/gws-project:/root/gws-project" \
  -v "gws-config:/root/.config/gws" \
  --workdir /root/gws-project \
  gws-cli:latest gws mcp -s drive,gmail,calendar,sheets,docs,tasks