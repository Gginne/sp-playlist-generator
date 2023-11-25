FROM python:3.11.0
WORKDIR /app

COPY requirements.txt app.py .env ./
RUN pip install -r requirements.txt

EXPOSE 8000
CMD ["gunicorn", "-b", ":8000", "app:app"]