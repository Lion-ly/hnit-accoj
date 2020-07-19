if [ ! -d "accoj/log" ]; then
  mkdir -p accoj/log
fi
pipenv run python wsgi.py
