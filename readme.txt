# Costamatoso Architecture Portfolio

## Description
Costamatoso is an architecture studio specializing in the design and construction of high-end residences and buildings. This project is a web platform designed to showcase their work and provide an easy-to-use interface for managing and presenting projects.

## Features

### Project Management
- **Create Projects**: Organize projects into folders with metadata (e.g., dimensions, year, type, and address).
- **Upload Files**: Add images or other files to project folders.
- **Rename and Delete**: Manage projects and files with intuitive controls.
- **Breadcrumb Navigation**: Easily navigate through project hierarchies.

### Presentation
- **Project Details**: Dedicated pages for each project, showcasing:
  - Cover image.
  - Metadata (dimensions, year, type, and address).
  - Image galleries.
- **Related Projects**: Highlight similar projects for better exploration.

### Blog
- **Create Articles**: Publish articles with titles, descriptions, and structured content.
- **Upload Images**: Include media to enhance blog posts.
- **Article Listing**: Display all articles with previews.

### Authentication
- **Secure Login**: Protect access to the dashboard with a password.

### Technology Stack
- **Frontend**: HTML, CSS, JavaScript.
- **Backend**: Python with Flask.
- **Database**: JSON-based file storage for metadata.
- **Web Server**: Nginx for production.
- **Application Server**: Gunicorn for serving the Flask application.

## Installation

### Requirements
- Python 3.8+
- pip
- Virtualenv
- Nginx (for production deployment)
- Gunicorn (for application serving)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repository/costamatoso.git
   cd costamatoso
   ```

2. **Create a Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application Locally**:
   ```bash
   python app.py
   ```
   Visit `http://127.0.0.1:5000` in your browser.

5. **Deploy to Production**:
   - Use Gunicorn to serve the application.
   - Configure Nginx as a reverse proxy.

## Deployment

### Gunicorn
Run the following command:
```bash
gunicorn -w 3 -b 0.0.0.0:5000 app:app
```

### Nginx Configuration
1. Create an Nginx site configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       location /static/ {
           alias /path/to/your/project/static/;
       }
   }
   ```

2. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### SSL (Optional)
Use Certbot to enable HTTPS:
```bash
sudo certbot --nginx -d your-domain.com
```

## Screenshots
_Add screenshots of your platform here._

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For any questions or inquiries, please contact us at [contact@costamatoso.com](mailto:contact@costamatoso.com).

