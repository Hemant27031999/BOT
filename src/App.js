import './App.css';
import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import FormControl from 'react-bootstrap/FormControl';
import VectorLayersExample from './Maps/MarkerMaps';
import Autosuggest from 'react-autosuggest';
import "./App.css";
import "./data.js"

const total_addresses = {
  'new_orleans': 22105,
  'phoenix': 16797
}

const serving_isps = {
  'new_orleans': {
    'cox': true,
    'att': true,
    'centurylink': false,
    'hugesnet': false,
    'xfinity': false,
    'viaset': false
  },
  'phoenix': {
    'cox': true,
    'att': false,
    'centurylink': true,
    'hugesnet': false,
    'xfinity': false,
    'viaset': false
  }
}

const center = [30.056708, -89.889852];

const get_result = async(value) => {
    const resp = await fetch('https://api.geocode.earth/v1/autocomplete?text={' + value + '}&api_key=ge-e9fe926bcada2d93',{
    method: 'get',
    headers: {
      'Host': 'api.geocode.earth',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate , br',
      'Origin': 'https://www.mapzen.com',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      'TE': 'trailers',
      'Referer': 'https://www.mapzen.com/',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    }
  });
  const data1 = await resp.json();
  return data1;
}

const getSuggestions = async(value) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  var res = await get_result(value)
  var data = []
  for(var ind in res.features){
    data.push({
      name: res.features[ind].properties.name,
      location: [res.features[ind].geometry.coordinates[1], res.features[ind].geometry.coordinates[0]]
    })
  }

  return data
};


const getSuggestionValue = suggestion => suggestion.name;

const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);


function renderColorLabelSingle() {
  return(
    <div class="bg-near-white mt4">
      <div className="d-flex justify-content-between" style = {{ height: 45, alignItems: 'flex-start'}}>
        <p class="ph2">0</p>
        <p class="ph2">13</p>
      </div>
      <div style={{
        'border': 0,
        'height': '5px',
        'background-image': 'linear-gradient(to right, rgba(255,255,255,255), rgba(0, 8, 122))'
      }} />
      <p class="tc">CV Values</p>
    </div>
  );
}


function renderColorLabelDouble() {
return(
    <div class="bg-near-white mt4">
      <div className="d-flex justify-content-between" style = {{ height: 45, alignItems: 'flex-start'}}>
        <p class="ph2">13</p>
        <p>0</p>
        <p class="ph2">13</p>
      </div>
      <div style={{
        'border': 0,
        'height': '5px',
        'background-image': 'linear-gradient(to right, rgba(122, 12, 0), rgba(255,255,255,255), rgba(24, 51, 41))'
      }} />
      <div className="d-flex justify-content-between" style = {{ height: 40}}>
        <p class="f7">(COX Dominates)</p>
        <p>CV Values</p>
        <p class="f7">(ATT Dominates)</p>
      </div>
    </div>
  );
}


function showSummary(data, isp, city) {
  var plans = []

  if(data !== null && (("cv_" + isp + "_dict") in data)){
    for (const [key, value] of Object.entries(data["cv_" + isp + "_dict"])) {
      let percentage = value/total_addresses[city.toLowerCase().replace(" ", "_")]*100;
      percentage = percentage.toFixed(2)
      plans.push(
        <tr>
          <th>{key}</th>
          <th>{percentage}</th>
        </tr>
      )
    }

    var pp = (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Carriage Value</th>
            <th>Percentage of Addresses</th>
          </tr>
        </thead>
        <tbody>
        {plans}
        </tbody>
      </Table>
    )

    return pp
  }

  return plans
}



class App extends Component {

  constructor(){
    super();
    this.state = {
      value: 'New Orleans',
      suggestions: [],
      center: center,
      isp: 'cox',
      compareTwoISPs: false,
      city: 'New Orleans',
      isp_summary: {}
    };
  }

  handleCallback = (childData) =>{
      this.setState({isp_summary: childData})
  }

  onChange = (event, {newValue}) => {
    this.setState({
      value: newValue
    })
  };

  onSuggestionsFetchRequested = async({ value }) => {
    this.setState({
      suggestions: await getSuggestions(value)
    });
  };

  onSuggestionSelected = (value, {suggestion}) => {
    this.setState({
      center: suggestion.location,
      city: suggestion.name,
      isp: 'cox'
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };


  render(){
    const { value, suggestions } = this.state;
    let modified_city = (this.state.city).toLowerCase().replace(" ", "_")
    const inputProps = {
      placeholder: 'Type a city name',
      value,
      onChange: this.onChange,
      className: "input"
    };

  return (
    <div className="flex">

      <div class="outline w-70 pa3 ma2">
        <VectorLayersExample 
          center={this.state.center} 
          isp={this.state.isp} 
          compareTwoISPs={this.state.compareTwoISPs} 
          city={this.state.city}
          parentCallback={this.handleCallback}
        />
      </div>

      <div class="outline w-30 ph3 ma2">

        {this.state.compareTwoISPs ?
          (renderColorLabelDouble()) :
          (renderColorLabelSingle())
        }

        <label className="control">
          <h3 className="label"><Badge bg="secondary">Enter City</Badge></h3>
          <Autosuggest
            aria-label="Default"
            aria-describedby="inputGroup-sizing-large"
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            inputProps={inputProps}
        />
        </label>

        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            ISP Selected: {(this.state.isp).toUpperCase()}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {serving_isps[modified_city]['cox'] && <Dropdown.Item onClick={() => {this.setState({isp: 'cox', compareTwoISPs: false})}}>Cox Comm.</Dropdown.Item>}
            {serving_isps[modified_city]['att'] && <Dropdown.Item onClick={() => {this.setState({isp: 'att', compareTwoISPs: false})}}>AT&T</Dropdown.Item>}
            {serving_isps[modified_city]['centurylink'] && <Dropdown.Item onClick={() => {this.setState({isp: 'centurylink', compareTwoISPs: false})}}>Centurylink</Dropdown.Item>}
            {serving_isps[modified_city]['xfinity'] && <Dropdown.Item onClick={() => {this.setState({isp: 'xfinity', compareTwoISPs: false})}}>Xfinity</Dropdown.Item>}
            {serving_isps[modified_city]['viaset'] && <Dropdown.Item onClick={() => {this.setState({isp: 'viaset', compareTwoISPs: false})}}>Viaset</Dropdown.Item>}
            {serving_isps[modified_city]['hugesnet'] && <Dropdown.Item onClick={() => {this.setState({isp: 'hugesnet', compareTwoISPs: false})}}>Hugesnet</Dropdown.Item>}
          </Dropdown.Menu>
        </Dropdown>

        <ToggleButton
          className="mt-3"
          id="toggle-check"
          type="checkbox"
          variant="outline-primary"
          checked={this.state.compareTwoISPs}
          value="1"
          onClick={() => {this.setState({compareTwoISPs: !this.state.compareTwoISPs})} }>
          Compare ISPs
        </ToggleButton>

        <div className="mt4">
          {!this.state.compareTwoISPs && (showSummary(this.state.isp_summary, this.state.isp, this.state.city))}
        </div>

      </div>

    </div>
  );
}
}

export default App;

