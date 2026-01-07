import time
from contextlib import contextmanager

@contextmanager
def traced_step(step_name: str, meta: dict | None = None):
    start = time.time()
    meta = meta or {}
    print(f"[TRACE] START {step_name} meta={meta}")
    try:
        yield
        elapsed_ms = int((time.time() - start) * 1000)
        print(f"[TRACE] END   {step_name} status=success elapsed_ms={elapsed_ms}")
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        print(f"[TRACE] END   {step_name} status=error elapsed_ms={elapsed_ms} err={repr(e)}")
        raise
