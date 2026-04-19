# WeatherNewsApp

![App Logo](assets/gossipaNewWeather.png)

WeatherNewsApp is a modern, cross-platform mobile app built with Expo and React Native. It delivers real-time weather forecasts, trending news, and music stories using only free public APIs. The app features a beautiful UI, offline caching, notifications, and robust error handling for a seamless user experience.

---

## Features

- **Weather Forecasts:** Powered by OpenWeatherMap
- **Trending News:** NewsData.io and African news sources
- **Trending Music & Stories:** iTunes, Reddit, Hacker News, and more
- **Local Notifications & Calendar Integration**
- **Offline Caching with SQLite**
- **Modern UI & Custom Branding**
- **Easy Environment Configuration**

---

## Screenshots

> assets/a.png
> assets/b.png
> assets/c.png
> assets/d.png
> assets/e.png

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Derrick121K/WeatherNewsApp.git
   cd WeatherNewsApp
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and add your API keys:
     ```sh
     cp .env.example .env
     # Edit .env and fill in your keys
     ```

### Running the App
- Start the Expo development server:
  ```sh
  npx expo start
  ```
- Build for production (Android):
  ```sh
  npx eas build -p android
  ```

---

## Deployment
- Ensure your `.env` file is not committed to git.
- Use `.env.example` for sharing config structure.
- Use EAS for production builds.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Credits
- App logo: _gossipaNewWeather.png_ (see `assets/`)
- Screenshots and additional references: _to be added on GitHub_
#
