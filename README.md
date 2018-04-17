# homebridge-weather-station-eve

This is a weather station plugin for [homebridge](https://github.com/nfarina/homebridge) using Weather Underground service.

This plugin is a fork of [homebridge-weather-station-extended](https://github.com/naofireblade/homebridge-weather-station-extended). However this plugin tries to emulate at best the Elgato Eve Weather accessory, including historical data for temperature, pressure and humidity. As a result, history and extra characteristics will show only in Eve.app, and the accessory will show as Unsupported in Home.app. If you want and accessory that is, at least partially, supported by Home.app use [homebridge-weather-station-extended](https://github.com/naofireblade/homebridge-weather-station-extended)

# Measured Values

The following values can be displayed and used in HomeKit rules:

- Temperature (with history)
- Air pressure (with history)
- Relative humidity (with history)
- Rain last hour (precip)
- Rain today (precip)
- UV-Index
- Visibility
- Weather Condition
- Weather Condition Category (Sunny = 0, Cloudy = 1, Rain = 2, Snow = 3)
- Wind direction
- Wind speed
- Station
- Time and date of last observation

# Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g simont77/homebridge-weather-station-eve`
3. Gather a free developer key for Weather Underground [here](http://www.wunderground.com/weather/api/).
4. Update your configuration file. See the sample below.

### Configuration

Add the following information to your config file. Make sure to add your API key and provide the station ID.

```json
"accessories": [
	{
		"accessory": "WUWeatherStationEve",
		"name": "Weather Station",
		"key": "XXXXXXXXXXXXXXX",
		"location": "IMILANO1"
	}
]
```

Location can also be an array of station IDs. The first one will be used on homebridge start, but the used station can be changed using the Predefined Station characteristic.
