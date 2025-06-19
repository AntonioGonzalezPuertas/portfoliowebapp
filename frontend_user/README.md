# PortfolioProjets <img src=".\src\assets\logo_trans.png" alt="logo"/>

This web application was developed as part of a FullStack course. It serves as a platform for users to showcase their professional profiles, manage projects, and interact with other users. The app demonstrates modern web development practices using Angular (frontend) and a Node.js/Express backend.

---

## What is PortfolioProjets?

PortfolioProjets is a portfolio and project management web app where users can:

- Main tabs: Projects, Profiles and Account
  - Projects: Search/Filter and visualize projects
  - Profiles: Search/Filter and visualize profiles
  - Account: Visualize profile account
- Browse and search (by text) /Filter (by category) users' projects
- Add, edit and delete projects (remove users from project)
- Browse and search (by text) /Filter (by technologies) users' profiles
- Create and edit users' personal profiles
- Contact administrators for support or feature requests

<img src=".\src\assets\Doc\diagram.PNG" alt="App Screenshot"/>

---

## Main Functionalities

- **User Authentication:** Sign up, log in, and log out securely.
  - LogIn by email/password
  - Sessions are stored to keep statistiques.
  - JWT is used received on LogIn to authenticate the requests
    - Profiles: Edit, Delete, Logout, ChangePassword, PostRequestAdmin
    - Projects: Create, Edit, Delete
  - Using google OAth 2.0 (functionality removed):
    - Removed to simplify the code and because it requires sharing my google development accocunt, but the fonctionality ready to cherrypick in the branch "add Login with Google OAuth2.0"
    - To be used, create file "environment.prod.ts" with a google client id for the project
  - Change password
  - Forgot password link request
    - Send email with a link to reset password
    - A second email is sent with a random password to access to the account and be able to change the password
      <img src=".\src\assets\Doc\resetPasswordEmail.PNG" alt="App Screenshot"/>
- **Profile Creation:** Create a profile with a unique username and password.
  - Sign up with email validation (JWT token)
    <img src=".\src\assets\Doc\validationEmail.PNG" alt="App Screenshot"/>
- **Profile Management:** Create, edit, and view user profiles with skills, biography, and contact details.
- **Project Management:** Add new projects, edit existing ones, assign technologies, pictures and manage project authors.
- **Search & Filter:** Search for profiles and projects, filter by technology or category.
- **Admin Contact:** Send messages to administrators for support or feedback.
- **Responsive Design:** Optimized for desktop and mobile devices.

---

## Implementation Details

**State Management:** Uses RxJS BehaviorSubject for authentication and profile state.

**Routing:** Angular Router with route guards for protected pages.

**Forms:** Reactive Forms for validation and user input.

**API Communication:** HTTPClient for RESTful API calls.

**Error Handling:** Toast notifications for user feedback.

---

## Technologies Used

**Frontend:** Angular, Ionic, TypeScript, RxJS, SCSS

**Authentication:** JWT, Google OAuth 2.0

**Other:** REST API, RxJS Observables, Responsive Design

---

## Folder Structure

```text
src/
  app/
    components/ # Reusable UI components
      utils/ # Utility components for Search and Filter
    guards/ # Guard for loggin in account page
    models/ # Profile and Project models
    pages/ # Subpages for creation and edit
    services/ # Services for Profiles, Projects and Authentication
      dummyData/ # Dummy json data for testing
    tab-account/ # LogIn and Account page
    tab-projects/ # Projects page
    tab-profiles/ # Profiles page
    tabs/ # Tabs logic and routing

  assets/ # Icons, images, and other assets
    Doc/ # Documentation images

  environment/ # Environment variables for development and production
```

---

## Missing to implement

- Unit and functional tests

- Cookies management

- Captha SingUp

- Lazy projects and profiles browsing

- Adding dynamic fields to projects and profiles

- ..

## License

This project is for educational purposes as part of a FullStack course.
