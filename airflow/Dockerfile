FROM apache/airflow:2.8.1-python3.11
COPY ingestion/requirements.txt /tmp/ingestion-requirements.txt
RUN pip install --no-cache-dir --user -r /tmp/ingestion-requirements.txt
