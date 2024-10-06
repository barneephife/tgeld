# Database Schema and Server-Side Data Management Plan

Created: 2024-07-23
Last Updated: 2024-07-23

This document serves as a comprehensive plan for developing the server-side database and data management system for your Taschengeld project.

## 1. Current Data Structure Review

Tables identified from the overview:

- users
- tasks
- completed_tasks
- piggybank_accounts
- piggybank_transactions

## 2. Existing Interfaces and Components

Ensure database structure supports:

- User Management
- Task Management
- Task Completion
- Payday Interface
- Piggy Bank Interface

## 3. Proposed Database Schema

### users Table

CREATE TABLE users (
user_id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
birthday DATE,
role VARCHAR(20) NOT NULL,
sound VARCHAR(255),
icon VARCHAR(50)
);

### tasks Table

CREATE TABLE tasks (
task_id SERIAL PRIMARY KEY,
title VARCHAR(100) NOT NULL,
description TEXT,
icon VARCHAR(50),
sound VARCHAR(255),
payout_value DECIMAL(10,2) NOT NULL,
active_status BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### completed_tasks Table

CREATE TABLE completed_tasks (
c_task_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id),
task_id INTEGER REFERENCES tasks(task_id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
comment TEXT,
attachment VARCHAR(255),
payment_status VARCHAR(20) DEFAULT 'Unpaid'
);

### piggybank_accounts Table

CREATE TABLE piggybank_accounts (
account_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id),
account_number VARCHAR(20) UNIQUE NOT NULL,
balance DECIMAL(15,2) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### piggybank_transactions Table

CREATE TABLE piggybank_transactions (
transaction_id SERIAL PRIMARY KEY,
account_id INTEGER REFERENCES piggybank_accounts(account_id),
amount DECIMAL(15,2) NOT NULL,
transaction_type VARCHAR(10) NOT NULL,
transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
description TEXT,
photo VARCHAR(255)
);

## 4. API Endpoints (To Be Implemented)

- GET /api/users
- POST /api/users
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- POST /api/completed-tasks
- GET /api/piggybank/:userId
- POST /api/piggybank/transaction

## 5. Data Access Layer

Plan to create a data access layer using an ORM (e.g., Prisma or Sequelize) or raw SQL queries.

## 6. Authentication and Authorization

Implement a robust authentication system to secure the API and ensure proper data access control.

## 7. Migration Strategy

Plan for migrating existing data from the mock database to the new server-side database.

## 8. Front-end Updates

Update front-end components to use the new API instead of the mock database.

## Progress Tracking

- [ ] Finalize database schema
- [ ] Set up development database
- [ ] Implement data access layer
- [ ] Create API endpoints
- [ ] Implement authentication and authorization
- [ ] Develop migration scripts
- [ ] Update front-end components
- [ ] Perform thorough testing
- [ ] Document API and database structure

## Next Steps

1. Review and finalize the proposed database schema
2. Set up a development database environment
3. Begin implementing the data access layer

## Notes

- Consider using PostgreSQL for the database due to its robustness and support for JSON data types, which could be useful for storing additional metadata.
- Evaluate the need for additional tables or fields as the project progresses.
- Consider implementing soft delete for relevant tables to maintain data history.
- Plan for database indexing to optimize query performance.
- Implement proper error handling and logging in the data access layer.
- Consider implementing database migrations for easier schema updates in the future.
- Consider adding a 'comments' field to the piggybank_transactions table
- Consider adding a 'photo' field to the piggybank_transactions table (as you've implemented client-side)
- Consider adding a 'sound' field to the tasks table
- Consider adding a 'sound' field to the users table

### To move forward with this plan, here are some suggested next steps:

1. Review the proposed database schema in detail. Ensure it covers all the necessary fields and relationships for your application's current and future needs.
2. Set up a development database environment. You might want to consider using Docker to create a consistent and easily reproducible database setup.
3. Choose an ORM (Object-Relational Mapping) tool for your data access layer. Given that you're using Next.js, Prisma could be a good choice as it integrates well with TypeScript and provides type-safe database access.
4. Start implementing the data access layer, beginning with the most crucial tables (like users and tasks).
5. As you implement the data access layer, also start creating the API endpoints. You can do this incrementally, replacing the mock data with real database queries one endpoint at a time.
6. Plan out your authentication and authorization strategy. Consider using a solution like NextAuth.js for handling user authentication.
7. Begin updating your front-end components to use the new API endpoints instead of the mock data.