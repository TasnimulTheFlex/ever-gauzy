"""Print one line whenever PMS signals a password change (LISTEN pms_password_changed); reconnects forever."""
import sys, time
import psycopg

while True:
    try:
        with psycopg.connect(autocommit=True, connect_timeout=10, keepalives_idle=60) as conn:
            conn.execute("LISTEN pms_password_changed")
            print("listening", flush=True)
            for _ in conn.notifies():
                print("changed", flush=True)
    except Exception as exc:  # network blips, RDS failover, credential rotation: retry
        print(f"error {type(exc).__name__}: {exc}", file=sys.stderr, flush=True)
        time.sleep(15)
