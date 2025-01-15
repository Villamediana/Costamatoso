🏛️ Costamatoso Architecture Portfolio
This project is a web platform for Costamatoso, an architecture studio specializing in high-end residences and buildings. The platform showcases their projects and offers an easy-to-use interface for project management and presentation.

🎨 Features
📂 Project Management
Create Projects: Organize projects with metadata (e.g., dimensions, year, type, and address).
📤 Upload Files: Add images or other files to project folders.
✏️ Rename and 🗑️ Delete: Easily manage project details and files.
🔗 Breadcrumb Navigation: Quickly navigate through project hierarchies.
🖼️ Presentation
Project Details: Individual pages for each project showcasing:
📌 Cover image.
🗂️ Metadata (dimensions, year, type, and address).
🖼️ Image galleries.
🔄 Related Projects: Highlight similar projects for better exploration.
📰 Blog
Create Articles: Publish structured articles with titles, descriptions, and media.
📸 Upload Images: Enhance blog posts with visuals.
🗂️ Article Listing: Display all articles with previews for easy navigation.
🔒 Authentication
Secure Login: Protect the dashboard with a secure password system.
🚀 How to Use
📋 Requirements
Python 3.8+
pip
Virtualenv
Nginx (for production deployment)
Gunicorn (for application serving)
🛠 Installation Steps
Clone the Repository:

bash
Copiar código
git clone https://github.com/your-repository/costamatoso.git
cd costamatoso
Create a Virtual Environment:

bash
Copiar código
python3 -m venv venv
source venv/bin/activate
Install Dependencies:

bash
Copiar código
pip install -r requirements.txt
Run the Application Locally:

bash
Copiar código
python app.py
Visit http://127.0.0.1:5000 in your browser.

Deploy to Production:

Use Gunicorn to serve the application.
Configure Nginx as a reverse proxy.
🛠 Technologies Used
Frontend: HTML, CSS, JavaScript.
Backend: Python with Flask.
Database: JSON-based file storage for metadata.
Web Server: Nginx for production.
Application Server: Gunicorn.
📄 License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it.

✨ Acknowledgements
This platform was developed to enhance Costamatoso's ability to showcase their architectural projects effectively. Thank you for your interest in supporting exceptional architecture!
