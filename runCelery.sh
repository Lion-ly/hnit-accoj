if [ ! -d "accoj/log" ]; then
  mkdir -p accoj/log
fi
celery worker -A celery_worker.celery --loglevel=INFO --without-gossip --without-mingle --without-heartbeat -Ofair -P gevent