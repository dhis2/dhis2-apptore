import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, CardText, CardTitle, CardHeader } from 'material-ui/Card';
import { Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Button from 'material-ui/RaisedButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { appLoad, addImageToApp, openDialog, deleteAppVersion } from '../../../actions/actionCreators';
import * as dialogType from '../../../constants/dialogTypes';
import VersionList from '../../appVersion/VersionList';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import Textfield from 'material-ui/TextField';
import Subheader from '../../header/SubHeader';
import Theme from '../../../styles/theme';
import { appTypesToUI } from '../../../constants/apiConstants';
import MultipleUploadFileFields from '../../form/MultipleUploadFileFields';
import ImageViewer from '../../appView/ImageViewer';
class UserAppView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.loadApp({appId: this.props.match.params.appId})
    }

    handleOpenDialog() {
        this.props.openNewVersionDialog({app: this.props.app});
    }

    handleOpenEditApp() {
        this.props.openEditAppDialog({app: this.props.app});
    }

    handleDeleteAppVersion(version) {
        this.props.deleteVersion(version, this.props.app.id);
    }

    renderStatusAlert() {
        const cardHeaderRightStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '14px',
            color: Theme.card.subtitleColor,
        }
        const statusAlertPending = "This app is pending approval."
        const statusAlertRejected = "This app has been rejected."

        return (<div style={cardHeaderRightStyle}><FontIcon style={{color: 'inherit', fontSize: '16px'}} className="material-icons">priority_high</FontIcon>
            {this.props.app.status == 'PENDING' ? statusAlertPending : statusAlertRejected}
        </div>)
    }

    submitUploadImages() {

        this.form.submit();
    }

    handleUploadImages(images) {

        for(let i = 0;i< images.length;i++) {
            const image = {
                image: {
                    caption: '',
                    descripton: '',
                    logo: false,
                },
                file: images[i]
            }

            this.props.addImageToApp(this.props.app.id, image);
        }
    }

    render() {
        const app = this.props.app;
        if(!app) {
            return null;
        }
        const FABStyle = {
            margin: 0,
            top: 0,
            right: 10,
            top: '-25px',
            position: 'absolute',
        };
        const rightIconButtonStyle = {
            position: 'absolute',
            top: 0,
            right: '4px'
        }

        const subtitle = (<div>Type: {appTypesToUI[app.appType]} <br />
            Author: {app.developer.name} <br />
            Organisation: {app.developer.organisation} </div>)
        let logo = app.images.filter(elem => elem.logo)[0];
        const avatarProps = {
            src: logo ? logo.imageUrl : null,
            icon: !logo ? <FontIcon className="material-icons">wallpaper</FontIcon>: null
        }

        return (
            <div>
                <Subheader title="App overview" backLink="/user">
                </Subheader>
                <Card>
                    <CardHeader title={app.name} avatar={<Avatar {...avatarProps} />}
                    subtitle={subtitle} titleStyle={{fontSize: '2em'}}>
                        {app.status == 'PENDING' || app.status == 'NOT_APPROVED' ? this.renderStatusAlert.bind(this)() : null}
                        <IconButton style={rightIconButtonStyle} onClick={this.handleOpenEditApp.bind(this)}>
                            <i className="material-icons">edit</i>
                        </IconButton>

                    </CardHeader>

                    <CardText>a
                        {app.description}
                    </CardText>

                </Card>
                <Card style={{marginTop: '10px', position: 'relative'}}>
                    <FloatingActionButton mini={true} style={FABStyle} onTouchTap={this.handleOpenDialog.bind(this)}>
                        <ContentAdd />
                    </FloatingActionButton>
                    <CardTitle title="Versions" />
                    <CardText>
                        <VersionList editable versionList={app.versions} app={app} handleDelete={this.handleDeleteAppVersion.bind(this)}/>
                    </CardText>
                </Card>
                <Card style={{marginTop: '10px', position: 'relative'}} expandable={true} expanded={false}>
                    <FloatingActionButton mini={true} style={FABStyle} onTouchTap={this.handleOpenDialog.bind(this)}>
                        <ContentAdd />
                    </FloatingActionButton>
                    <CardTitle title="Images" actAsExpander={true}/>
                    <CardText style={{paddingLeft: 0, paddingRight: 0}}>
                        <ImageViewer images={app.images} appId ={app.id} editable/>
                    </CardText>
                    <CardText>
                        <h2>Upload images</h2>
                        <MultipleUploadFileFields ref={ref => this.form = ref} submitted={this.handleUploadImages.bind(this)} />
                        <Button primary onClick={this.submitUploadImages.bind(this)} icon={<FontIcon className="material-icons">file_upload</FontIcon>} />
                    </CardText>
                </Card>
            </div>
        )
    }
}

UserAppView.propTypes = {

}

const mapStateToProps = (state, ownProps) => ({
   app: state.user.appList.byId[ownProps.match.params.appId]
})

const mapDispatchToProps = (dispatch) =>  ({
    loadApp(appid) {
        dispatch(appLoad(appid));
    },

    addImageToApp(appid, image) {
        dispatch(addImageToApp(appid, image));
    },

    deleteVersion(version,appId) {
        dispatch(deleteAppVersion(version, appId))
    },

    openNewVersionDialog(dialogProps) {
        dispatch(openDialog(dialogType.NEW_VERSION, dialogProps))
    },

    openEditAppDialog(dialogProps) {
        dispatch(openDialog(dialogType.EDIT_APP, dialogProps))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(UserAppView);