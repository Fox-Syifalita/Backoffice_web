# Punokawan POS App

A comprehensive Point of Sale (POS) mobile application with web dashboard for back office management, developed by Punokawan Group.

## 📱 Overview

**Punokawan POS App** is a modern, feature-rich point of sale solution that combines a Flutter mobile application with a web-based dashboard. Designed specifically for retail businesses, it provides complete inventory management, sales tracking, and reporting capabilities.

- **Version**: v1.0.0
- **Release Date**: May 23, 2025
- **Developer**: Syifalita
- **Organization**: Punokawan Mart / Punokawan Group

## ✨ Key Features

### Mobile App Features
- **User Authentication** - Secure login system
- **Inventory Management** - Track and manage products
- **Employee Management** - Restricted access controls
- **Supplier Management** - Manage supplier relationships
- **Customer Management** - Customer database and profiles
- **Sales Processing** - Complete sales transaction handling
- **Discount System** - Flexible discount management
- **Purchase Orders** - Streamlined purchasing workflow
- **Receipt Generation** - Digital and printable receipts
- **Product Catalog** - Comprehensive item management
- **Settings** - Customizable app configuration

### Web Dashboard (Back Office)
- **Comprehensive Reporting**
  - Monthly, Weekly, Daily reports
  - Custom date range reports
  - Supplier performance reports
  - Category and item analysis
  - Interactive charts and graphs
- **Detailed Analytics** - In-depth business insights
- **Data Management** - Centralized data editing and control

## 🛠️ Tech Stack

- **Frontend (Mobile)**: Flutter
- **Frontend (Web)**: Web Dashboard
- **Backend**: API-based architecture
- **Platform Support**: iOS, Android, Web

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- Android Studio / VS Code
- iOS development setup (for iOS builds)
- Web development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/punokawan-group/punokawan-pos-app.git
   cd punokawan-pos-app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure environment**
   - Set up your API endpoints
   - Configure authentication settings
   - Update app configuration files

4. **Run the application**
   ```bash
   # For mobile development
   flutter run
   
   # For web dashboard
   flutter run -d web
   ```

## 📋 Project Structure

```
punokawan-pos-app/
├── lib/
│   ├── models/          # Data models
│   ├── screens/         # UI screens
│   ├── widgets/         # Reusable components
│   ├── services/        # API and business logic
│   ├── utils/           # Helper functions
│   └── main.dart        # App entry point
├── assets/              # Images, fonts, etc.
├── web/                 # Web dashboard files
├── android/             # Android-specific files
├── ios/                 # iOS-specific files
└── pubspec.yaml         # Dependencies
```

## 🔧 Configuration

### API Configuration
Update the API endpoints in your configuration file:
```dart
class ApiConfig {
  static const String baseUrl = 'your-api-base-url';
  static const String authEndpoint = '/auth';
  // Add other endpoints
}
```

### App Settings
Customize app settings in the settings configuration:
- Store information
- Receipt formatting
- Tax calculations
- User permissions

## 📊 Reporting Features

The web dashboard provides extensive reporting capabilities:

- **Sales Reports**: Track daily, weekly, and monthly sales performance
- **Inventory Reports**: Monitor stock levels and product performance
- **Supplier Analysis**: Evaluate supplier relationships and performance
- **Customer Insights**: Analyze customer behavior and preferences
- **Financial Reports**: Comprehensive financial tracking and analysis

## 🔐 Security Features

- Secure user authentication
- Role-based access control
- Data encryption
- Secure API communication
- Employee access restrictions

## 📝 License

This project is proprietary software owned by Punokawan Group. All rights reserved.

## 📞 Support

For support and inquiries:
- **Organization**: Punokawan Group
- **Developer**: Syifalita
- **Project**: Punokawan Mart POS System

## 🗓️ Release Notes

### v1.0.0 (2025)
- Initial release
- Complete mobile POS functionality
- Web dashboard implementation
- Comprehensive reporting system
- Multi-platform support

## 📱 Screenshots

--

## 🎯 Roadmap

- [ ] Enhanced analytics features
- [ ] Multi-store support
- [ ] Advanced inventory forecasting
- [ ] Customer loyalty programs
- [ ] Integration with external payment systems
- [ ] Mobile receipt printing
- [ ] Offline mode capabilities

---
