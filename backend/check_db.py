import pymysql
from werkzeug.security import check_password_hash

conn = pymysql.connect(host='localhost', user='root', password='!L0ve2C0de', database='campus_placement')
cursor = conn.cursor()

cursor.execute("SELECT id, name, email, password, approved_status FROM Students LIMIT 5")
students = cursor.fetchall()
print("=== STUDENTS ===")
for s in students:
    pw_hash = s[3]
    print(f"ID={s[0]}, Name={s[1]}, Email={s[2]}, Status={s[4]}")
    print(f"  Password hash: {pw_hash[:60]}...")
    print(f"  Hash type: {'werkzeug' if pw_hash.startswith(('pbkdf2:', 'scrypt:')) else 'unknown/plaintext/other'}")

cursor.execute("SELECT id, company_name, email, password, approved_status FROM Companies LIMIT 5")
companies = cursor.fetchall()
print("\n=== COMPANIES ===")
for c in companies:
    pw_hash = c[3]
    print(f"ID={c[0]}, Name={c[1]}, Email={c[2]}, Status={c[4]}")
    print(f"  Password hash: {pw_hash[:60]}...")
    print(f"  Hash type: {'werkzeug' if pw_hash.startswith(('pbkdf2:', 'scrypt:')) else 'unknown/plaintext/other'}")

cursor.execute("SELECT id, username, password FROM Admin LIMIT 5")
admins = cursor.fetchall()
print("\n=== ADMINS ===")
for a in admins:
    pw_hash = a[2]
    print(f"ID={a[0]}, Username={a[1]}")
    print(f"  Password hash: {pw_hash[:60]}...")
    print(f"  Hash type: {'werkzeug' if pw_hash.startswith(('pbkdf2:', 'scrypt:')) else 'unknown/plaintext/other'}")

conn.close()
