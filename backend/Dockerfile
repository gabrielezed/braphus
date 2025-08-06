# Use an official lightweight Python image.
FROM python:3.9-slim

# Set the working directory to the backend code folder
WORKDIR /app/backend

# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY ./backend .

# The command to run the application, pointing directly to the file
# The format is <module_name>:<flask_app_variable>
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]