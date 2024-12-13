# Farmerline Assessment

This is the **Farmerline Assessment Project**, a Laravel application integrated with React and Inertia.js. Follow the steps below to set up, configure, and run the project.

---

## Prerequisites

Ensure the following are installed on your system:

- PHP 8.1 or higher
- Composer
- Node.js (with npm or yarn)
- MySQL or MariaDB
- Git

---

## Installation Steps

### 1. Clone the Repository

```bash
$ git clone <repository-url>
$ cd farmerline-assessment
```

### 2. Install Backend Dependencies

Run the following command to install Laravel dependencies:

```bash
$ composer install
```

Additionally, include Guzzle for HTTP requests:

```bash
$ composer require guzzlehttp/guzzle
```

### 3. Install Frontend Dependencies

Install JavaScript dependencies for React and Inertia:

```bash
$ npm install
```

Add required libraries for the frontend:

```bash
$ npm install date-fns@^4.1.0 sweetalert2@^11.14.5 wavesurfer.js@^7.8.10
```

### 4. Configure the Environment

Copy the `.env.example` file to `.env` and set up the required configurations:

```bash
$ cp .env.example .env
```

Update the following in the `.env` file:

- **Database Configuration:**

  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=farmerline_assessment
  DB_USERNAME=<your-database-username>
  DB_PASSWORD=<your-database-password>
  ```

- **Whisper API Key:**

  ```env
  WHISPER_API_KEY=<your_whisper_api_key>
  ```

### 5. Generate Application Key

Run the following command to generate the application key:

```bash
$ php artisan key:generate
```

### 6. Migrate the Database

Run migrations to create the necessary tables:

```bash
$ php artisan migrate
```

### 7. Build Assets

Compile frontend assets using the following:

```bash
$ npm run dev
```

For production builds:

```bash
$ npm run build
```

### 8. Start the Development Server

Run the Laravel development server:

```bash
$ composer run dev
```

The application will be accessible at [http://localhost:8000](http://localhost:8000).

---

## Key Features and Libraries

- **Laravel**: Backend framework for robust API and server-side logic.
- **React**: Frontend framework for dynamic user interfaces.
- **Inertia.js**: Bridges the Laravel and React ecosystem.
- **Libraries:**
  - `date-fns` for date manipulation.
  - `sweetalert2` for elegant alerts and notifications.
  - `wavesurfer.js` for interactive audio waveforms.

---

## Troubleshooting

- Ensure all prerequisites are installed and their versions are compatible.
- If migrations fail, confirm your database credentials in the `.env` file.
- For API issues, verify the `WHISPER_API_KEY` is set correctly.

For further assistance, contact the project maintainer.

---

**Happy coding!**

