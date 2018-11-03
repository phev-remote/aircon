#!/bin/bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
docker build -t gcr.io/phev-db3fa/github.com/phev-remote/aircon:arm32v7 -f Dockerfile.arm32v7 .
