import React from 'react';
import './moment-readings.css';
export default function MomentReading({reading}) {
  if(!reading) return null;
  return <section className="moment-reading"><h4>{reading.title}</h4><p>{reading.text}</p>{reading.action && <p className="moment-action"><strong>Para llevarlo a tu día</strong>{reading.action}</p>}{reading.question && <p className="moment-question">{reading.question}</p>}</section>;
}
