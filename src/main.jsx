import React, { useState, useEffect } from "react";
import { useAsyncError, useLocation } from "react-router-dom";
import "./main_css.css";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Radar, Bar } from "react-chartjs-2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { use } from "react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Main = () => {
  const location = useLocation();
  const { userInput } = location.state || {};
  const [aqi, setAqi] = useState(null);
  const [co, setCo] = useState("");
  const [nh3, setNh3] = useState("");
  const [no, setNo] = useState("");
  const [no2, setNo2] = useState("");
  const [o3, setO3] = useState("");
  const [pm2_5, setPm2_5] = useState("");
  const [pm10, setPm10] = useState("");
  const [so2, setSo2] = useState("");
  const [population, setPopulation] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [highestPollutant, setHighestPollutant] = useState("");
  const [aqicategory, setAqiCategory] = useState("");
  const [aqiremarks, setAqiremarks] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [wind, setWind] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [name, setName] = useState("");

  const fetchAirPollutionData = async () => {
    try {
      const geocodingResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${userInput}&appid=ad4b36e7f471b0715cbe39f0066b47d7`
      );
      const {
        coord: { lat, lon },
      } = geocodingResponse.data;
      console.log(geocodingResponse);
      const pollutionResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=ad4b36e7f471b0715cbe39f0066b47d7`
      );
      const historyResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${Math.floor(
          Date.now() / 1000 - 4 * 24 * 60 * 60
        )}&end=${Math.floor(
          Date.now() / 1000
        )}&appid=ad4b36e7f471b0715cbe39f0066b47d7`
      );

      setMapUrl(
        `https://tile.openweathermap.org/map/wind_new/10/${Math.floor(
          ((lon + 180) / 360) * Math.pow(2, 10)
        )}/${Math.floor(
          (((1 -
            Math.log(
              Math.tan((lat * Math.PI) / 180) +
                1 / Math.cos((lat * Math.PI) / 180)
            )) /
            Math.PI +
            1) /
            2) *
            Math.pow(2, 10)
        )}.png?appid=ad4b36e7f471b0715cbe39f0066b47d7`
      );

      const pollutionData = pollutionResponse.data.list[0].components;
      setName(geocodingResponse.data.name);
      setHistory(historyResponse.data.list);
      setAqi(pollutionResponse.data.list[0].main.aqi);
      setCo(pollutionData.co * 0.0064935064935065);
      setNh3(pollutionData.nh3 * 0.5);
      setNo(pollutionData.no);
      setNo2(pollutionData.no2 * 0.5);
      setO3(pollutionData.o3 * 1.5555555);
      setPm2_5(pollutionData.pm2_5 * 1.33333333);
      setPm10(pollutionData.pm10 * 0.5);
      setSo2(pollutionData.so2 * 0.2857142857142857);
      setTemperature(
        parseFloat((geocodingResponse.data.main.temp - 273.15).toFixed(2))
      );

      setWind(geocodingResponse.data.wind.speed);
      setHumidity(geocodingResponse.data.main.humidity);
      setLoading(false); // Data loading complete
      const highest = (() => {
        const pollutants = [
          { value: pollutionData.co * 0.0064935064935065, name: "CO" },
          { value: pollutionData.nh3 * 0.5, name: "NH3" },
          { value: pollutionData.no, name: "NO" },
          { value: pollutionData.no2 * 0.5, name: "NO2" },
          { value: pollutionData.o3 * 1.5555555, name: "O3" },
          { value: pollutionData.pm2_5 * 1.33333333, name: "pm2_5" },
          { value: pollutionData.pm10 * 0.5, name: "PM10" },
          { value: pollutionData.so2 * 0.2857142857142857, name: "SO2" },
        ];
        return pollutants.reduce((max, current) =>
          current.value > max.value ? current : max
        ).name;
      })();

      setHighestPollutant(highest); // Set the highest pollutant
      setLoading(false);
    } catch (error) {
      console.error("Error fetching air pollution data:", error);
      setLoading(false);
    }
  };
  const getPopulation = async () => {
    try {
      const response = await axios.get(
        `http://api.geonames.org/searchJSON?q=${userInput}&maxRows=1&username=rinesh`
      );
      if (response.data.geonames.length > 0) {
        setPopulation(response.data.geonames[0].population);
        setError("");
      } else {
        setError("City not found.");
      }
    } catch {
      setError("An error occurred while fetching data.");
    }
  };

  useEffect(() => {
    if (userInput) {
      fetchAirPollutionData();
      getPopulation();
    }
  }, [userInput]);

  const aqiPercentage = (aqi / 5) * 100;
  useEffect(() => {
    if (aqiPercentage <= 20) {
      setAqiCategory("Excellent");
      setAqiremarks(
        "The air is fresh and clean, making it ideal for outdoor activities for everyone"
      );
    } else if (aqiPercentage <= 40) {
      setAqiCategory("Good");
      setAqiremarks(
        "Air quality is good, posing little to no risk to the general population"
      );
    } else if (aqiPercentage <= 60) {
      setAqiCategory("Moderate");
      setAqiremarks(
        "Air quality is acceptable; however, sensitive individuals may experience minor discomfort"
      );
    } else if (aqiPercentage <= 80) {
      setAqiCategory("Poor");
      setAqiremarks(
        "Air pollution levels are elevated; people with respiratory conditions should limit prolonged outdoor exposure"
      );
    } else if (aqiPercentage <= 100) {
      setAqiCategory("Extreme");
      setAqiremarks(
        "Air quality is unhealthy; everyone, especially sensitive groups, should take precautions and limit outdoor activities"
      );
    }
  }, [aqiPercentage]);

  const radarData = {
    labels: ["CO", "NH3", "NO", "NO2", "O3", "PM2.5", "PM10", "SO2"],
    datasets: [
      {
        label: "Pollutant Levels (in μg/m3)",
        data: [co, nh3, no, no2, o3, pm2_5, pm10, so2],
        backgroundColor: "rgba(34, 202, 236, 0.2)",
        borderColor: "rgba(34, 202, 236, 1)",
      },
    ],
  };

  const historyData = {
    labels: history.map((item) =>
      new Date(item.dt * 1000).toLocaleDateString()
    ),
    datasets: [
      {
        label: `${highestPollutant.toUpperCase()} Levels Over Time (μg/m3)`, // Correct string concatenation
        data: history.map(
          (item) => item.components[highestPollutant.toLowerCase()]
        ),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="main-container">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading </p>
        </div>
      ) : (
        <>
          <div className="intro">
            <p className="city-info">{name}</p>
          </div>

          <div className="aqi-container">
            <CircularProgressbar
              value={aqiPercentage}
              text={`AQI: ${aqi}`}
              styles={buildStyles({
                pathColor:
                  aqi <= 2 ? "#2ECC71" : aqi <= 4 ? "#F1C40F" : "#E74C3C",
                textColor: "#2C3E50",
                trailColor: "#D3D3D3",
              })}
            />
            <div>
              <div className="all-attributes">
                <div className="popu">
                  <p className="population">
                    <img src="/icons/groups.png" className="population-icon" />
                    {population}
                  </p>
                </div>

                <div className="attributes">
                  <p className="chara">
                    <img className="temp-icon" src="/icons/temperature.png" />
                    {temperature}°<br />
                    <img className="wind-icon" src="/icons/wind.png" /> {wind}{" "}
                    m/s <br />
                    <img
                      className="humidity-icon"
                      src="/icons/humidity.png"
                    />{" "}
                    {humidity}%
                  </p>
                </div>
              </div>

              <p className="aqi-desc">
                The air quality index (AQI) for <b>{name}</b> is currently{" "}
                <b>{aqi}</b>. With a population of approximately{" "}
                <b>{population}</b>, the city's air quality is classified as{" "}
                <b>{aqicategory}</b>. This means that {aqiremarks}. Stay
                informed and take necessary precautions if needed.
              </p>
            </div>
          </div>

          <div className="pollutant-section">
            <h2>Pollutant Levels</h2>
            <Radar data={radarData} />
          </div>

          <div className="history-section">
            <h2>Historical {highestPollutant.toUpperCase()} Levels</h2>
            <Bar data={historyData} />
          </div>

          <div
            id="map"
            style={{ width: "100%", height: "400px", marginTop: "20px" }}
          ></div>
        </>
      )}
    </div>
  );
};

export default Main;
