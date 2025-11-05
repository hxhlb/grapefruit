#!/bin/sh

tmux new-session -d -s igf
tmux rename-window -t igf:0 'igf-dev'
tmux split-window -h
tmux send-keys -t igf:0.0 'cd agent && npm run dev' C-m
tmux send-keys -t igf:0.1 'cd igf && npm run dev' C-m
tmux attach-session -t igf
