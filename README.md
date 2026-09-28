# Inventory Management System

A web-based Inventory Management System developed using Flask and MySQL to manage products, categories, suppliers, customers, purchases, sales, inventory, and reports.

## Features

- JWT-based authentication
- Role-based access control
- Admin, Manager, and Staff roles
- Category management
- Product management
- Supplier management
- Customer management
- Purchase management
- Sales management
- Automatic stock increase on purchases
- Automatic stock deduction on sales
- Stock movement tracking
- Inventory management
- Sales and purchase reports
- COGS and gross profit calculation
- Database migrations using Flask-Migrate
- Responsive web interface using Bootstrap

## Technologies Used

- Python
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-Bcrypt
- MySQL
- PyMySQL
- HTML5
- CSS3
- JavaScript
- Bootstrap
- Jinja2

## Project Structure

```text
Inventory-management-system/
│
├── app.py
├── config.py
├── extensions.py
├── requirements.txt
├── migrations/
├── models/
├── routes/
├── services/
├── templates/
├── static/
└── test.http
Installation
1. Clone the repository
git clone https://github.com/nida627/Inventory-menegement-system.git
cd Inventory-menegement-system
2. Create a virtual environment
python -m venv env
3. Activate the virtual environment

Windows PowerShell:

.\env\Scripts\Activate.ps1
4. Install dependencies
pip install -r requirements.txt
5. Configure environment variables

Create a .env file in the project root:

SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=inventory_management_system

Do not upload the .env file to GitHub.

6. Run database migrations
flask db upgrade
7. Start the application
python app.py

Open:

http://127.0.0.1:5000
System Workflow
User Login
    ↓
Role Authentication
    ↓
Dashboard
    ↓
Master Data
    ↓
Purchase
    ↓
Stock Increase
    ↓
Inventory
    ↓
Sale
    ↓
Stock Decrease
    ↓
Reports
User Roles
Role	Main Access
Admin	Full system access
Manager	Master data, purchases, sales and inventory
Staff	View data, manage sales and view reports
Reports

The system provides:

Stock Report
Sales Report
Purchase Report
Profit Report
Cost of Goods Sold (COGS)
Gross Profit
Profit Calculation
Gross Profit = Total Sales - COGS
Security
Passwords are securely hashed using Flask-Bcrypt.
JWT is used for authentication.
Role-based authorization protects restricted operations.
Sensitive configuration is stored using environment variables.
.env is excluded from Git tracking.
Project Status

Completed

The core authentication, database, CRUD modules, purchase and sales transactions, inventory management, reporting, and frontend integration have been implemented and tested.

Author

Nida Ansari
