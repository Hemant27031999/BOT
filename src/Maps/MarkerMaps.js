import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Polygon,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
  UpdateMapCenter,
  useMap
} from 'react-leaflet';
import new_orleans from './new_orleans.txt';
import phoenix from './phoenix.txt';
import React, { useState, Component } from 'react';
import Button from 'react-bootstrap/Button';

const fillBlueOptions = { fillColor: 'blue' }
const blackOptions = { color: 'black' }
const limeOptions = { color: 'lime' }
const purpleOptions = { color: 'purple' }
const redOptions = { color: 'red' }

const singleColor = '#00087a'
const doubleColor1 = '#7a0c00'
const doubleColor2 = '#014a44'

const MAX_COX = 100
const MIN_COX = 0

const CV_MAX = 13
const CV_MIN = 0


function UpdateMapCentre(props) {
  const map = useMap();
  map.panTo(props.mapCentre);
  return null;
} 


function parseJSON(string){
  var array = JSON.parse(string);
  return array
}


function csvToArray(str, delimiter = ";") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  let isp_plans = {}
  let cv_values = {}
  var arr = []
  for(var i=0; i<rows.length; i++){
    var row = rows[i]
    if(row === ''){
     continue;
    }
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      let colName = header.trim()
      if(colName === "Coordinates" || colName === "cv_cox_dict" || colName === "cv_att_dict" || colName === "cv_centurylink_dict"){
        object[colName] = parseJSON(values[index]);
        if(colName !== "Coordinates"){
          if(!(colName in isp_plans)){
            isp_plans[colName] = {}
          }
          for (const [key, value] of Object.entries(object[colName])) {
            if(!(key in isp_plans[colName])){
              isp_plans[colName][key] = 0
            }
            isp_plans[colName][key] += value
          }
        }
      }
      else if(colName === "cv_att_avg" || colName === "cv_cox_avg" || colName === "cv_centurylink_avg"){
        object[colName] = parseFloat(values[index]);
      }
      else{
        object[colName] = values[index];
      }

      return object;
    }, {});
    arr.push(el)
  }

  return [isp_plans, arr];
}


const readData = async(value) => {
  var val = value.toLowerCase().replace(" ", "_")
  var res = ''
  if(val === 'new_orleans') res = await fetch(new_orleans)
  else res = await fetch(phoenix)

  res = await res.text()
  var parsedData = csvToArray(res)
  return parsedData
};


function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


function makePolygons(data, isp, compare){

  var poly = []
  let sz = data.length

  if(!compare){
    let range = CV_MAX - CV_MIN;

    for(let i = 0; i < sz; i++){
      let opa = data[i]['cv_' + isp + '_avg']/range
      poly.push(
        <Polygon 
          key={i}
          pathOptions={{
            color: '#ffffff',
            opacity: opa,
            fillColor: singleColor,
            fillOpacity: opa
          }}
          positions={data[i]['Coordinates']}
          // eventHandlers={{
          //   mouseover: () => {console.log(i)}
          // }}
        >
        <Tooltip>{"My Carriage value is: " + data[i]['cv_'+ isp +'_avg'].toFixed(2)}</Tooltip>
        </Polygon>
      )
    }
  }
  else{
    let range = CV_MAX - CV_MIN;
    let second_isp = Object.keys(data[0])[3]
    second_isp = second_isp.split("_")[1]
    for(let i = 0; i < sz; i++){
      let diff = data[i]['cv_cox_avg'] - data[i]['cv_'+ second_isp +'_avg']
      let currentColor = ''
      let currentRange = 0
      let opa = 0

      if(diff>0){
        currentColor = doubleColor1
        opa = data[i]['cv_cox_avg']/range
      }
      else{
        currentColor = doubleColor2
        opa = data[i]['cv_'+ second_isp +'_avg']/range
      }

      poly.push(
        <Polygon 
          key={i}
          pathOptions={{
            color: currentColor,
            opacity: opa,
            fillColor: currentColor,
            fillOpacity: opa
          }}
          positions={data[i]['Coordinates']}
          // eventHandlers={{
          //   mouseover: () => {console.log(i)}
          // }}
        >
        <Tooltip>{"COX Carriage value: " + data[i]['cv_cox_avg'].toFixed(2) + "," + second_isp.toUpperCase() + " Carriage value: " + data[i]['cv_'+ second_isp +'_avg'].toFixed(2)}</Tooltip>
        </Polygon>
      )
    }
  }

  return poly
}


class VectorLayersExample extends Component {

  constructor(props){
    super(props);
    this.state = {
      res: [],
      isp: this.props['isp'],
      city: this.props['city'].toLowerCase().replace(" ", "_")
    }
  }

  async componentDidMount() {
    var rr = await readData(this.state.city)
    this.setState({ res: rr[1]});
    this.props.parentCallback(rr[0])
  }

  async componentDidUpdate(){
    var lowercase_city = this.props['city'].toLowerCase().replace(" ", "_")
    if(this.state.city !== lowercase_city){
      var rr = await readData(this.props.city)
      this.props.parentCallback(rr[0])
      this.setState({
        isp: this.props.isp,
        city: lowercase_city,
        res: rr[1]
      })
    }
  }

  render(){

    return (
      <div>
        <MapContainer center={this.props.center} zoom={13}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={this.props.center} pathOptions={fillBlueOptions} radius={200} />
          {/*<CircleMarker
            center={center}
            pathOptions={redOptions}
            radius={20}
            data-tip="hello world"
            >
            <Popup>Popup in CircleMarker</Popup>
          </CircleMarker>*/}
          {makePolygons(this.state.res, this.props.isp, this.props.compareTwoISPs)}
          <UpdateMapCentre mapCentre={this.props.center} />
        </MapContainer>
      </div>
    );
  }
}

export default VectorLayersExample;