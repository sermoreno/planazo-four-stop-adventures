import {z} from 'zod';
export const WEATHER_ENDPOINT='https://api.open-meteo.com/v1/forecast';
export const RAIN_THRESHOLD=50;
export const HEAT_THRESHOLD=34;
export const MADRID={lat:40.4168,lng:-3.7038};
const forecastSchema=z.object({
  daily:z.object({time:z.array(z.string()),weather_code:z.array(z.number()),temperature_2m_max:z.array(z.number()),temperature_2m_min:z.array(z.number()),precipitation_probability_max:z.array(z.number().nullable())}),
  hourly:z.object({time:z.array(z.string()),temperature_2m:z.array(z.number()),precipitation_probability:z.array(z.number().nullable())}),
});
export type Forecast=z.infer<typeof forecastSchema>;
export type DayForecast={date:string;code:number;max:number;min:number;rain:number};
export function parseForecast(json:unknown):Forecast{return forecastSchema.parse(json);}
export function suggestIndoor(rainProbability:number){return rainProbability>=RAIN_THRESHOLD;}
export function heatWarning(max:number){return max>=HEAT_THRESHOLD;}
function iso(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function nextWeekendDates(now:Date){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate());const day=d.getDay();const toSat=day===0?-1:(6-day);const sat=new Date(d);sat.setDate(d.getDate()+toSat);const sun=new Date(sat);sun.setDate(sat.getDate()+1);return {sat:iso(sat),sun:iso(sun)};}
export function dayForecast(f:Forecast,date:string):DayForecast|null{const i=f.daily.time.indexOf(date);if(i<0)return null;return {date,code:f.daily.weather_code[i]??0,max:Math.round(f.daily.temperature_2m_max[i]??0),min:Math.round(f.daily.temperature_2m_min[i]??0),rain:f.daily.precipitation_probability_max[i]??0};}
export function hourAt(f:Forecast,date:string,time:string){const i=f.hourly.time.indexOf(`${date}T${time.slice(0,2)}:00`);if(i<0)return null;return {temp:Math.round(f.hourly.temperature_2m[i]??0),rain:f.hourly.precipitation_probability[i]??0};}
export function describe(code:number){if(code===0)return {icon:'☀️',text:'Despejado'};if(code<=2)return {icon:'🌤️',text:'Poco nuboso'};if(code===3)return {icon:'☁️',text:'Nublado'};if(code<=48)return {icon:'🌫️',text:'Niebla'};if(code<=67||(code>=80&&code<=82))return {icon:'🌧️',text:'Lluvia'};if(code<=77||code===85||code===86)return {icon:'❄️',text:'Nieve'};return {icon:'⛈️',text:'Tormenta'};}
export async function fetchForecast(lat:number,lng:number):Promise<Forecast>{const url=`${WEATHER_ENDPOINT}?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability&timezone=Europe%2FMadrid&forecast_days=16`;const r=await fetch(url);if(!r.ok)throw new Error(`Open-Meteo ${r.status}`);return parseForecast(await r.json());}
export function forecastQuery(lat:number,lng:number){return {queryKey:['weather',lat.toFixed(2),lng.toFixed(2)],queryFn:()=>fetchForecast(lat,lng),staleTime:30*60_000,retry:1};}
