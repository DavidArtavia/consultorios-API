# Consultorios API

## Description

This API allows managing the information of legal consultancies, including the creation, updating, deletion, and querying of consultancy data.

## API Structure

### Endpoints

1. The implemented API endpoints are available:
   [Postman endpoints](https://gold-spaceship-124028.postman.co/workspace/David~634df219-77d1-47fc-9b34-42c00ade5c01/collection/19333935-2eff82c0-3fcc-4490-bd32-11cd07d33e5c?action=share&creator=19333935)
2. It is recommended to use `Postman` to visualize the endpoints.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/DavidArtavia/consultorios-API.git
   ```
2. Navigate to the project directory:
   ```sh
   cd consultorios-API
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

## Development Configuration

You need to create a file named `.env` at the root of the project.

Suggested content:


```sh
DB_NAME=consultorios_db  
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
SECRET= abc
# PROD | QA | DEV
APP_ENV=DEV
# ES | EN
LANGUAGE_APP=ES
```

## Usage

1. Start the server:
   ```sh
   npm run dev
   ```
2. Access the API at `http://localhost:3000`.

## Recommendations

1. Use the `.en.example` to see the correct definition of the database credentials.

2. `postgreSQL` is used as the database manager.

## Migrations

1. To generate a migration file with predefined `up` and `down` methods:

   ```sh
   npx sequelize-cli migration:generate --name add-example
   ```

2. To apply all pending migrations:

   ```sh
   npx sequelize-cli db:migrate
   ```

3. To undo all migrations:

   ```sh
   npx sequelize-cli db:migrate:undo
   ```

4. To apply a specific migration:

   ```sh
   npx sequelize-cli db:migrate --name 20240930230219-create-name-table.js
   ```

5. To undo a specific migration:
   ```sh
   npx sequelize-cli db:migrate:undo --name 20240930230219-create-name-table.js
   ```

## License

```

```
