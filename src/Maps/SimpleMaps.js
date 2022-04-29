import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class SimpleMap extends Component {
  static defaultProps = {
    center: {
      lat: 41.750824,
      lng: -87.574725
    },
    zoom: 11
  };

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyCHU7ZHodJWH887avGkkQcdNq2xigpM2HU" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <AnyReactComponent
            lat={41.750824}
            lng={-87.574725}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    );
  }
}

export default SimpleMap;
  var res = ''

  if(value === 'new_orleans') res = await fetch(new_orleans)
  else res = await res.text(phoenix)

  console.log()
  var parsedData = csvToArray(res)
  return parsedData
  console.log(res)

  return []