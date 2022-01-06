import React from 'react';
import { formatMessage } from 'umi-plugin-locale';

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getTime();
  }

  componentDidMount() {
    this.setTimer();
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  setTimer() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.updateClock.bind(this), 1000);
  }

  updateClock() {
    this.setState(this.getTime, this.setTimer);
  }

  getTime() {
    const currentTime = new Date();
    return {
      year: currentTime.getFullYear(),
      month: currentTime.getMonth() + 1,
      date: currentTime.getDate(),
      hours: currentTime.getHours(),
      minutes: currentTime.getMinutes(),
      seconds: currentTime.getSeconds(),
      ampm:
        currentTime.getHours() >= 12
          ? formatMessage({ id: 'lianmed.pm' })
          : formatMessage({ id: 'lianmed.am' }),
    };
  }

  render() {
    const { year, month, date, hours, minutes, seconds, ampm } = this.state;
    return (
      <div style={{ display: 'inline-block', fontSize: '.1rem', color: '#333' }}>
        <span style={{ marginRight: '0.08rem' }}>
          {year}-{month > 9 ? month : `0${month}`}-{date > 9 ? date : `0${date}`}
        </span>
        <span>
          {hours}:{minutes > 9 ? minutes : `0${minutes}`}:{seconds > 9 ? seconds : `0${seconds}`}{' '}
          {ampm}
        </span>
      </div>
    );
  }
}

export default Clock;
