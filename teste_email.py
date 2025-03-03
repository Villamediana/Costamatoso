import smtplib

EMAIL = "jose.villamediana.osorio@gmail.com"  # Tu Gmail
APP_PASSWORD = "yhsl apqh sics zddu"  # Reemplaza con el App Password
TO_EMAIL = "miguel.villamediana@outlook.com"

with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login(EMAIL, APP_PASSWORD)
    server.sendmail(EMAIL, TO_EMAIL, "Subject: Test Email\n\nHello, this is a test!")
    print("Email enviado con éxito!")
