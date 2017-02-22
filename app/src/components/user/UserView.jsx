import React, {Component} from 'react';
import {connect} from 'react-redux';
import Grid from '../../material/Grid/Grid';
import Col from '../../material/Grid/Col';
import FontIcon from 'material-ui/FontIcon';
import {Link, Route} from 'react-router-dom';

import {List, ListItem} from 'material-ui/List';
import AppUpload from './appUpload/AppUpload';
import AppList from './appList/AppList';
import { userLoad } from '../../actions/actionCreators';
class UserView extends Component {

    componentDidMount() {
        this.props.loadUser();
    }

    render() {
        return (
            <Grid>
                <Col span={2}>
                    <List style={{padding: 0}}>
                        <Link to={this.props.match.url}>
                            <ListItem primaryText="Apps" leftIcon={<FontIcon className="material-icons">list</FontIcon>}/>
                        </Link>
                        <Link to={`${this.props.match.url}/upload`}>
                            <ListItem primaryText="Upload" leftIcon={<FontIcon className="material-icons">file_upload</FontIcon>}/>
                        </Link>

                    </List>
                </Col>
                <Col span={8}>
                    <Route exact path={`${this.props.match.url}`} component={AppList}>
                    </Route>
                    <Route path={`${this.props.match.url}/upload`} component={AppUpload}/>
                </Col>
            </Grid>
        )
    }
}

const mapStateToProps = (state) => ({
    appList: state.appsList.appList,
});

const mapDispatchToProps = (dispatch) => ({
    loadUser() {
        dispatch(userLoad());
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(UserView);
