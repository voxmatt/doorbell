#!/usr/bin/env python3

import time
import automationhat
import sys

import queue
import threading


def main():
  command_queue = queue.LifoQueue()
  read_thread = threading.Thread(target=read_loop, args=[command_queue])
  read_thread.start()
  run_loop(command_queue)


def read_loop(command_queue):
  while True:
    command_queue.put_nowait(sys.stdin.readline().rstrip('\n'))


def run_loop(command_queue):
  thread_local = threading.local()
  thread_local.doorbell_on_state = False

  while True:
    try_command(command_queue)
    read_doorbell(thread_local)

def try_command(command_queue):
  try:
    command = command_queue.get(timeout=0.5)
  except queue.Empty:
    pass
  else:
    run_command(command)

def run_command(command):
  if command == "latch_unlock":
    automationhat.relay.one.on()
    print("latch_is_unlocked")
  elif command == "latch_lock":
    automationhat.relay.one.off()
    print("latch_is_locked")
  elif isinstance(command, str):
    print(command)

def read_doorbell(thread_local):
  doorbell_on_state = automationhat.input.one.read() == 1

  if doorbell_on_state != thread_local.doorbell_on_state:
    thread_local.doorbell_on_state = doorbell_on_state
    print("doorbell_is_on") if doorbell_on_state else print("doorbell_is_off")

if __name__ == "__main__":
  main()
