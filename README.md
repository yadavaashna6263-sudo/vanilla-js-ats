# Frontend Recruitment Application System (ATS)

A multi-page Applicant Tracking System built using HTML, CSS, and JavaScript. The project simulates a real recruitment portal where candidates can browse jobs, fill out an application, upload a resume, create an account, review their information, and track their application status.

## Features

* Multi-page application flow
* Real-time form validation
* Resume upload with drag-and-drop support
* Searchable skills with autocomplete
* Profile Completion and Readiness Scores
* Dashboard with application status timeline
* Password strength meter
* LocalStorage-based draft persistence
* Responsive design and dark/light mode
* Accessibility features and error summaries

## Pages

Home → Jobs → Personal Information → Professional Information → Experience & Resume → Account → Review → Success → Dashboard

## Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* LocalStorage API

## How to Run

1. Clone the repository.
2. Open `index.html` in your browser.

No installation, build tools, or backend setup is required.

## Project Structure

The project is organized into separate HTML pages with dedicated CSS and JavaScript files for validation, storage, theme handling, skills management, resume uploads, and dashboard functionality.

## Notes

* Resume uploads store only file metadata in LocalStorage.
* Passwords are not stored.
* The dashboard uses demo data because there is no backend integration.
