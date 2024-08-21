const express=require('express')
const app=express();
const path=require('path')
const axios=require('axios');
const {DateTime} = require('luxon');

const port=8000;

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname,"public/css")))
app.use(express.static(path.join(__dirname,"public/js")))
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.render("home.ejs", { weatherData: null,localTime: null, localDate: null,sunrise: null, sunset: null, message: null });
});
app.post("/",async (req,res)=>{

    console.log("Request Body",req.body);
    const cityName =req.body.city;
    console.log("City Name:", cityName);
    let weatherData = null;
    let localDate=null;
    let localTime=null;
    let sunrise = null;
    let sunset = null;
    let message='';
    if(cityName){
        try{
            let apilink = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=4209017bb5882f95346e5d37925e8617`;
            const response = await axios.get(apilink); 
            if(response.data && response.data.cod==='404'){
               // message='Data not found';
            }else{
                weatherData=response.data; 
            }
            
            if(weatherData.name===cityName){

                const timezoneOffsetSeconds = weatherData.timezone;
                const currentTimeUTC = DateTime.now().setZone('UTC');
                const currentTime = currentTimeUTC.plus({ seconds: timezoneOffsetSeconds });

            
                localTime=currentTime.toFormat('HH:mm a');
                localDate=currentTime.toFormat('cccc d MMMM yyyy');

                
                const sunriseUTC = DateTime.fromSeconds(weatherData.sys.sunrise).setZone('UTC');
                const sunsetUTC = DateTime.fromSeconds(weatherData.sys.sunset).setZone('UTC');
                sunrise = sunriseUTC.plus({ seconds: timezoneOffsetSeconds }).toFormat('HH:mm a');
                sunset = sunsetUTC.plus({ seconds: timezoneOffsetSeconds }).toFormat('HH:mm a');


                console.log('Local Time:', localTime);
                console.log('Local Date:', localDate);
                console.log('Sunrise:', sunrise);
                console.log('Sunset:', sunset);

            }
            }catch(error){
                console.error('Error fetching data:', error);
                // res.status(500).send('Error fetching data');
                // return
                message = "No Data Found ...";
            }   
    }else{
        message='Kindly enter name!';
    }

    //console.log('Data to render:', { weatherData, localTime, localDate,sunrise,sunset,message }); 
    res.render("home.ejs", { weatherData: weatherData,localTime:localTime,localDate:localDate,sunrise: sunrise, sunset: sunset,message:message});
    //console.log("Data recieved")
    
});
app.listen(port,()=>{
    console.log(`Listening to port no ${port}`)
})
