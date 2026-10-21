FROM python:3.12-alpine
RUN pip install --no-cache-dir "psycopg[binary]==3.2.10"
COPY listen.py /listen.py
CMD ["python", "-u", "/listen.py"]
