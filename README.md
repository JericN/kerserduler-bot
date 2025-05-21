# 📅 Discord Deadline Reminder Bot

A Discord automation tool designed to streamline deadline reminders for students and organization members.  
Built with **Node.js**, the **Discord API**, and the **Google Calendar API**, this bot helps notify channels about upcoming deadlines by integrating with a centralized calendar system.

## 🚀 Features

Ideal for student organizations, school groups, or teams that need centralized deadline tracking and automated Discord reminders.

- 🔍 **List Deadlines**: Search and display all upcoming events from Google Calendar.
- 📢 **Broadcast Reminders**: Automatically send deadline reminders to designated Discord channels using a predefined message template.
- 🛑 **Unsend Messages**: Revert broadcasts to recover from unexpected errors.
- ✅ **System Validation**: Ensure all integrations and components are functioning properly.

## 🧠 How It Works

1. The bot connects to a Google Calendar that acts as the content management system (CMS).
2. Events are fetched in real time and parsed to identify deadlines.
3. Using defined rules, the bot formats and sends messages to specific Discord channels where reminders are needed.

## 🛠 Commands

| Command    | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `list`     | Displays all upcoming events fetched from Google Calendar.                 |
| `send`     | Sends formatted reminders for upcoming deadlines to the appropriate channels. |
| `unsend`   | Deletes previously sent reminders (for handling unexpected issues).         |
| `validate` | Checks the system status and ensures calendar/Discord connections are active.|

## 📚 Tech Stack

- Node.js – Backend runtime for handling logic and APIs
- Discord.js – Library to interact with the Discord API
- Google Calendar API – Event data source and content management

## 📦 Setup & Installation

To install dependencies:

```bash
npm install
```

To start the bot:
```bash
npm run start
```

## 🧹 Linting & Formatting

To check and enforce code style and formatting:
```bash
npm run check
```

## 📄 License

MIT License – see LICENSE file for details.
