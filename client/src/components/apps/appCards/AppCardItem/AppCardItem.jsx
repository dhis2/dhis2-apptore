import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'
import config from '../../../../../config'
import AppIcon from '../AppIcon/AppIcon'
import styles from './AppCardItem.module.css'

const summarise = text => {
    const maxLength = 120
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '…'
    }
    return text
}

const AppCardItem = ({ id, name, developer, type, description, images }) => {
    const logo = images.find(elem => elem.logo)

    return (
        <Link to={`/app/${id}`}>
            <div className={styles.appCard}>
                <header className={styles.appCardHeader}>
                    <AppIcon src={logo?.imageUrl} />
                    <div>
                        <h2 className={styles.appCardName}>{name}</h2>
                        <span className={styles.appCardMetadata}>
                            {developer.organisation || developer.name}
                        </span>
                        <span className={styles.appCardMetadata}>
                            {config.ui.appTypeToDisplayName[type]}
                        </span>
                    </div>
                </header>

                <p className={styles.appCardDescription}>
                    {summarise(description)}
                </p>
            </div>
        </Link>
    )
}

AppCardItem.propTypes = {
    developer: PropTypes.shape({
        name: PropTypes.string,
        organisation: PropTypes.string,
    }).isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string,
    images: PropTypes.array,
}

export default AppCardItem