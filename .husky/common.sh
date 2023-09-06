command_exists () {
  command -v "$1" >/dev/null 2>&1
}

nvm () {
  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm $@
  else
    echo "WARN: cannot find nvm.  some tasks may hang unexpectidly"
  fi
}

# Workaround for Windows 10, Git Bash and Yarn
if command_exists winpty && test -t 1; then
  exec < /dev/tty
fi
