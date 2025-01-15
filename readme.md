# Online Collaborative Coding Platform

An interactive web application for real-time collaborative coding. This platform enables mentors and students to work together seamlessly on JavaScript code blocks with live updates, role-based features, and a clean, intuitive interface.

## Features

- **Lobby Page**: Choose from a list of predefined code blocks.
- **Real-Time Collaboration**: Students edit code blocks with live updates visible to the mentor.
- **Role-Based Access**: Mentor has a read-only view, while students have editable access.
- **Code Matching Feedback**: Displays a smiley face when the student's code matches the solution.
- **Room Management**: Each code block has its own room with automatic redirection if the mentor leaves.

## Tech Stack

### Client-Side:
- **React**: For building the user interface.
- **CodeMirror**: As the text editor with syntax highlighting.
- **Socket.IO Client**: For real-time communication.

### Server-Side:
- **Node.js with Express**: For building the backend server.
- **Socket.IO**: For WebSocket-based real-time communication.

### Database:
- **MongoDB Atlas**: For storing code blocks.

### Deployment:
- **Client**: Deployed on [Netlify](codelingo-moveo.netlify.app).
- **Server**: Deployed on Render.
- **Database**: MongoDB Atlas.

## Database Design

**Collection: `CodeBlocks`**
- `_id`: Unique identifier for each code block.
- `title`: Name of the code block (e.g., "Async case").
- `initialTemplate`: The starting code snippet.
- `solution`: The correct solution for the code block.

## Pages Overview

### Lobby Page
- **Title**: "Choose code block"
- **Features**:
  - List of code blocks fetched from the database.
  - Clicking on a code block redirects to the Code Block Page.

### Code Block Page
- **Features**:
  - Title: Displays the code block name.
  - **Text Editor**:
    - Mentor: Read-only view.
    - Students: Editable view with real-time updates.
  - **Role Indicator**: Display whether the user is a mentor or a student.
  - Real-time count of students in the room.
  - Displays a smiley face when the code matches the solution.
  - Redirects students to the lobby if the mentor leaves.

## Real-Time Communication

- **Socket.IO** is used for real-time collaboration:
  - **Mentor-Student Identification**: The first user in the room becomes the mentor.
  - **Code Synchronization**: Students see real-time updates to the code.
  - **User Count**: Real-time display of the number of students in the room.
  - **Room Management**:
    - Each code block has a unique room.
    - Automatically redirect students to the lobby if the mentor disconnects.

- **Deployed Application URL**: Hosted and functional at: [Codelingo](codelingo-moveo.netlify.app)


## Future Enhancements and additions

- Add authentication for mentors and students.
- Allow saving progress for students.
- Enable multiple mentors per code block.