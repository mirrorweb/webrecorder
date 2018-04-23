import React from 'react';
import { connect } from 'react-redux';

import { RemoteBrowserUI } from 'components/controls';


const mapStateToProps = ({ app }) => {
  const remoteBrowsers = app.get('remoteBrowsers');
  return {
    autoscroll: app.getIn(['controls', 'autoscroll']),
    clipboard: app.getIn(['toolBin', 'clipboard']),
    inactiveTime: remoteBrowsers.get('inactiveTime'),
    reqId: remoteBrowsers.get('reqId'),
    sidebarResize: app.getIn(['sidebar', 'resizing'])
  };
};

export default connect(
  mapStateToProps
)(RemoteBrowserUI);